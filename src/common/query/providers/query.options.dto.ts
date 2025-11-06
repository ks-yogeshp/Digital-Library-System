import { FindOptionsRelations, FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';
import { QueryDto } from '../dtos/query.dto';
import { SearchFieldMap } from '../types/query.types';

export class QueryOptionsDto<T extends ObjectLiteral, M extends Record<string, any> = Record<string, any>> {
  /**
   * Query parameters (pagination, search, filters, sorting)
   */
  query!: QueryDto;

  /**
   * TypeORM repository for the entity being queried
   */
  repository!: Repository<T>;

  /**
   * Optional search field map
   * Defines which entity fields are searchable
   */
  searchFieldMap?: SearchFieldMap<M>;

  /**
   * Optional base WHERE clause(s)
   * Can be a single object or an array (OR)
   */
  where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];

  /**
   * Optional relations to include
   */
  relations?: FindOptionsRelations<T>;

  /**
   * Control partial behavior for search/filter logic
   */
  partial?: {
    search?: boolean;
    filter?: boolean;
  };
}
