import { Model } from 'mongoose';

import { QueryDto } from '../dtos/query.dto';

type SearchFieldMap<M extends Record<string, any>> = {
  [K in keyof M]?: Array<keyof M[K]>;
};
export type SearchOptions = 'partial' | 'startsWith' | 'endsWith' | 'exact' | 'fulltext';
export class QueryOptionsMongoDto<T, M extends Record<string, any> = Record<string, any>> {
  /**
   * Query parameters (pagination, search, filters, sorting)
   */
  query!: QueryDto;

  /**
   * TypeORM repository for the entity being queried
   */
  model!: Model<T>;

  /**
   * search field map
   * Defines which entity fields are searchable
   */
  searchFieldMap!: SearchFieldMap<M>;

  /**
   * Optional base WHERE clause(s)
   * Can be a single object or an array (OR)
   */
  // where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];

  /**
   * Optional relations to include
   */
  relations?: string[];

  /**
   * Control partial behavior for search/filter logic
   */
  searchOptions?: SearchOptions;
}
