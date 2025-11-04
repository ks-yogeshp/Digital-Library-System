import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import {
  DataSource,
  FindOptionsRelations,
  FindOptionsWhere,
  ObjectLiteral,
  Raw,
  Repository,
} from 'typeorm';
import { QueryDto } from '../dtos/query.dto';
import { Query } from '../interfaces/query.interface';
import { SearchFieldMap } from '../types/query.types';
import { InjectDataSource } from '@nestjs/typeorm';


@Injectable({ scope: Scope.REQUEST })
export class QueryProvider{
  constructor(

    @Inject(REQUEST)
    private readonly request: Request,

    @InjectDataSource()
    private readonly dataSource: DataSource ,

  ) {}


  public async query<T extends ObjectLiteral,M extends Record<string,any>>(
    query: QueryDto,
    repository: Repository<T>,
    searchFieldMap?: SearchFieldMap<M>,
    where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    relations?: FindOptionsRelations<T>,
  ) {

    let whereArray: FindOptionsWhere<T>[] = [];

    if (where) {
      whereArray = Array.isArray(where) ? [...where] : [where];
    }

    if (query.search) {


      const buildWhere = (
        repo: Repository<any>,
        search: string,
        visitedEntities: Set<string> =new Set(),
      ): FindOptionsWhere<any>[]=> {

        const result:FindOptionsWhere<any>[] =[]
        const entity = repo.metadata.targetName;

        if(visitedEntities.has(entity)){
          return [];
        }

        visitedEntities.add(entity);

        const fields: string[]= 
          searchFieldMap?.[entity as keyof M]?.map(f=>f.toString()) ?? 
          repo.metadata.columns.map((c) => c.propertyName);

        fields.forEach((field)=> {
          
          const column = repo.metadata.columns.find(c => c.propertyName === field);
          if(!column){
            return
          }

          result.push({
                [field]: Raw((alias) => `${alias} ::text ILIKE :search`, { search: `%${search}%` }),
              });
        });

          repo.metadata.relations.forEach((relation)=> {
            if(!fields.includes(relation.propertyName)){
              return
            }

            const relatedMeta = relation.inverseEntityMetadata;
            const relatedRepo = this.dataSource.getRepository(relatedMeta.target)

            const nestedWhere = buildWhere(
              relatedRepo,
              search,
              visitedEntities
            );

            nestedWhere.forEach((w)=> result.push({[relation.propertyName]: w}))
          })

        


        return result;

      }

      const searchWhere = buildWhere(repository,query.search);
      const mergedWhere = searchWhere.map(s => ({
        ...s,
        ...where,
      }));

      whereArray = [...mergedWhere];

    }

    const [result, totalItems] = await repository.findAndCount({
      where: whereArray.length ? whereArray : undefined,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      relations
    });

    const baseUrl = this.request.protocol + '://' + this.request.headers.host + '/';
    const newUrl = new URL(this.request.url, baseUrl);
    const totalPages = Math.ceil(totalItems / query.limit);
    const nextPage = query.page === totalPages ? query.page : query.page + 1;
    const previousPage = query.page === 1 ? query.page : query.page - 1;

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
        currentPage: query.page,
        totalPage: Math.ceil(totalItems / query.limit),
      },
      links: {
        first: buildPageLink(1),
        last: buildPageLink(totalPages),
        current: buildPageLink(query.page),
        next: buildPageLink(nextPage),
        previous: buildPageLink(previousPage),
      },
    };

    return response;

  }
}


