import type { Request } from 'express';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { And, FindOptionsOrder, FindOptionsWhere, ObjectLiteral, Raw } from 'typeorm';

import { QueryOptionsDto } from '../dtos/query.options.dto';
import { QueryFilterService } from './query-filter.service';
import { QuerySearchService } from './query-search.service';

@Injectable({ scope: Scope.REQUEST })
export class QueryService {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,

    private readonly querySearchService: QuerySearchService,

    private readonly queryFilterService: QueryFilterService
  ) {}

  public async query<T extends ObjectLiteral, M extends Record<string, any>>(
    options: QueryOptionsDto<T, M>
  ): Promise<{ result: T[]; totalItems: number; newUrl: URL }> {
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
      AndWhere = this.queryFilterService.filterWhere(repository, query.filters);
    }

    if (query.search) {
      OrWhere = this.querySearchService.searchWhere(repository, query.search, partial.search, searchFieldMap);
    }

    let finalWhere: FindOptionsWhere<T>[] = [];

    if (OrWhere.length === 0) {
      finalWhere = [AndWhere];
    } else {
      finalWhere = OrWhere.map((w) => {
        const orKey = Object.keys(w)[0];
        const hasAndKey = Object.prototype.hasOwnProperty.call(AndWhere, orKey);

        if (!hasAndKey) {
          return { ...w, ...AndWhere };
        }

        const nonConflictingWhere = { ...AndWhere };
        delete nonConflictingWhere[orKey];

        // Early return if no filters/search
        if (!query.filters || !query.search) {
          return {} as FindOptionsWhere<T>;
        }

        type ColumnType = T[typeof orKey];

        const filterOperator = this.queryFilterService.singleWhere<T, ColumnType>(
          query.filters[orKey],
          orKey,
          repository
        );

        const searchOperator = this.querySearchService.singleWhere<T, ColumnType>(
          query.search,
          orKey,
          repository,
          partial.search
        );

        if (!filterOperator || !searchOperator) {
          return {} as FindOptionsWhere<T>;
        }

        // Both operators exist → handle Raw or And cases
        const hasSqlA = AndWhere[orKey]?.['getSql'];
        const hasSqlB = w[orKey]?.['getSql'];
        if (hasSqlA && hasSqlB) {
          const newParams = {
            search1: searchOperator['objectLiteralParameters']?.['search'],
            search2: filterOperator['objectLiteralParameters']?.['values'],
          };

          const afterAnd: FindOptionsWhere<T> = {};

          if (!partial.search) {
            afterAnd[orKey as keyof T] = Raw(
              (alias) => `:search1 ILIKE ANY ( ${alias} ::text[] ) and ${alias} && :search2`,
              { ...newParams }
            ) as any;
          } else {
            afterAnd[orKey as keyof T] = Raw(
              (alias) => `${alias} ::text ILIKE :search1 and ${alias} && :search2`,
              { ...newParams }
            ) as any;
          }

          return {
            ...nonConflictingWhere,
            ...afterAnd,
          };
        }

        // Fallback to And operator merge
        return {
          ...nonConflictingWhere,
          [orKey]: And(filterOperator, searchOperator),
        } as FindOptionsWhere<T>;
      }).filter((x): x is FindOptionsWhere<T> => Object.keys(x).length > 0);
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
    const baseUrl = this.request.protocol + '://' + this.request.headers.host + '/';
    const newUrl = new URL(this.request.url, baseUrl);

    const response = {
      result,
      totalItems,
      newUrl,
    };

    return response;
  }
}
