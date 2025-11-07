import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import {
  And,
  FindOperator,
  FindOptionsOrder,
  FindOptionsWhere,
  ObjectLiteral,
  Raw,
} from 'typeorm';
import { Query } from '../interfaces/query.interface';
import { SearchQueryProvider } from './search-query.provider';
import { FilterQueryProvider } from './filter-query.provider';
import { QueryOptionsDto } from '../dtos/query.options.dto';

@Injectable({ scope: Scope.REQUEST })
export class QueryProvider {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,

    private readonly searchQueryProvider: SearchQueryProvider,

    private readonly filterQueryProvider: FilterQueryProvider,
  ) { }

  public async query<T extends ObjectLiteral, M extends Record<string, any>>(
    options: QueryOptionsDto<T, M>,
  ) {
    const {
      query,
      repository,
      searchFieldMap,
      where,
      relations,
      partial = { search: true, filter: true },
    } = options;

    let whereArray: FindOptionsWhere<T>[] = [];

    if (where) {
      whereArray = Array.isArray(where) ? [...where] : [where];
    }

    let AndWhere: FindOptionsWhere<T> = {};
    let OrWhere: FindOptionsWhere<T>[] = [];

    if (query.filters) {
      AndWhere = this.filterQueryProvider.filterWhere(
        repository,
        query.filters,
      );
    }

    if (query.search) {
      OrWhere = this.searchQueryProvider.searchWhere(
        repository,
        query.search,
        partial.search,
        searchFieldMap,
      );
    }

    let finalWhere: FindOptionsWhere<T>[] = [];
    if (OrWhere.length > 0) {
      finalWhere = OrWhere.map((w) => {
        const orKey = Object.keys(w)[0];
        if (AndWhere.hasOwnProperty(orKey)) {
          const nonConfiltingWhere = { ...AndWhere };
          delete nonConfiltingWhere[orKey];
          if (query.filters && query.search) {
            type ColumnType = T[typeof orKey];
            const filterOperator:
              | FindOperator<ColumnType>
              | ColumnType
              | undefined = this.filterQueryProvider.singleWhere<T, ColumnType>(
                query.filters[orKey],
                orKey,
                repository,
              );
            const searchOperator:
              | FindOperator<ColumnType>
              | ColumnType
              | undefined = this.searchQueryProvider.singleWhere<T, ColumnType>(
                query.search,
                orKey,
                repository,
                partial.search,
              );
            if (filterOperator && searchOperator) {
              if (AndWhere[orKey]?.['getSql'] && w['getSql']) {
                const newparam = {
                  search1: filterOperator['objectLiteralParameters']['search'],
                  search2: searchOperator['objectLiteralParameters']['search'],
                };
                console.log(
                  `::text ${filterOperator['getSql'].toString().split('::text')[1]}1 and  ::text ${searchOperator['getSql'].toString().split('::text')[1]}2`,
                );
                return {
                  ...nonConfiltingWhere,
                  [orKey]: Raw(
                    (alias) =>
                      `${alias} ::text ${filterOperator['getSql'].toString().split('::text')[1].replaceAll('`', '')}1 and ${alias} ::text ${searchOperator['getSql'].toString().split('::text')[1].replaceAll('`', '')}2`,
                    { ...newparam },
                  ),
                };
              } else {
                return {
                  ...nonConfiltingWhere,
                  [orKey]: And(filterOperator, searchOperator),
                } as FindOptionsWhere<T>;
              }
            }
          } else return {};
        }
        return {
          ...w,
          ...AndWhere,
        };
      });
    } else {
      finalWhere = [AndWhere];
    }

    if (whereArray.length > 1) {
      //change remaining
      whereArray = whereArray.map((w) => ({ ...finalWhere, ...w }));
    } else {
      whereArray = finalWhere;
    }

    let order: FindOptionsOrder<T> = {};
    if (query.sortBy) {
      order = {
        [query.sortBy]: query.sortOrder ?? 'ASC',
      } as FindOptionsOrder<T>;
    }
    const [result, totalItems] = await repository.findAndCount({
      where: whereArray.length ? whereArray : undefined,
      order: order,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      relations,
    });

    const baseUrl =
      this.request.protocol + '://' + this.request.headers.host + '/';
    const newUrl = new URL(this.request.url, baseUrl);
    const totalPages = Math.max(Math.ceil(totalItems / query.limit), 1);
    const currentPage = query.page < 1 ? 1 : query.page;
    const nextPage = currentPage >= totalPages ? totalPages : currentPage + 1;
    const previousPage = currentPage <= 1 ? 1 : currentPage - 1;

    const buildPageLink = (page: number) => {
      const params = new URLSearchParams(newUrl.search);
      params.set('page', page.toString());

      return `${newUrl.origin}${newUrl.pathname}?${params.toString()}`;
    };

    let response: Query<T> = {
      data: result,
      meta: {
        itemsPerPage: query.limit,
        totalItems: totalItems,
        currentPage: currentPage,
        totalPage: totalPages,
      },
      links: {
        first: buildPageLink(1),
        last: buildPageLink(totalPages),
        current: buildPageLink(currentPage),
        next: buildPageLink(nextPage),
        previous: buildPageLink(previousPage),
      },
    };

    return response;
  }
}
