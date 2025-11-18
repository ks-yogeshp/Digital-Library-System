import { Injectable } from '@nestjs/common';
import {
  Any,
  Between,
  FindOperator,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  ObjectLiteral,
  Raw,
  Repository,
} from 'typeorm';

import { FilterOperatorValueDto } from '../dtos/filter-operator-value.dto';

@Injectable()
export class QueryFilterService {
  private parseValue(value: any): any {
    if (typeof value !== 'string') return value;

    if (value === 'true') return true;
    if (value === 'false') return false;

    const num = parseInt(value);
    // console.log("num")
    if (!isNaN(num) && isFinite(num)) return num;

    if (Array.isArray(value)) {
      return value.map((v) => this.parseValue(v));
    }
    return value;
  }
  private operatorMap<V>(key: string, value: any): FindOperator<V> | V | undefined {
    const search = this.parseValue(value);
    switch (key) {
      case 'eq':
        return search as V;
      // case 'neq':
      //   return Not(search) as FindOperator<V>;
      case 'gt':
        return MoreThan(search) as FindOperator<V>;
      case 'gte':
        return MoreThanOrEqual(search) as FindOperator<V>;
      case 'lt':
        return LessThan(search) as FindOperator<V>;
      case 'lte':
        return LessThanOrEqual(search) as FindOperator<V>;
      case 'like':
        return Like(`%${search}%`) as FindOperator<V>; // Note: 'like' is often case-sensitive
      case 'ilike':
        return ILike(`%${search}%`) as FindOperator<V>;
      case 'isNull':
        return search === true ? IsNull() : (Not(IsNull()) as FindOperator<V>);
      case 'in':
        return In(Array.isArray(search) ? search : [...search.split(',')]) as FindOperator<V>;
      case 'any':
        return Any(Array.isArray(search) ? search : [...search.split(',')]) as FindOperator<V>;
      case 'between':
        if (Array.isArray(search) && search.length === 2) {
          return Between(search[0], search[1]) as FindOperator<V>;
        }
        throw new Error(
          `Invalid value for 'between' operator. Expected an array of two elements, got: ${JSON.stringify(search)}`
        );
      // case 'nin':
      //   return Not(In(Array.isArray(search) ? search : [search])) as FindOperator<V>;

      default:
        return undefined;
    }
  }

  public filterWhere = <T extends ObjectLiteral>(
    repo: Repository<T>,
    filters: Record<string, FilterOperatorValueDto>
  ): FindOptionsWhere<T> => {
    const result: FindOptionsWhere<T> = {};

    for (const key in filters) {
      if (Object.prototype.hasOwnProperty.call(filters, key)) {
        const column = repo.metadata.columns.find((c) => c.propertyName === key);
        if (!column) {
          continue;
        }
        const filterValue = filters[key];
        const operator = Object.keys(filterValue)[0];
        const value = filterValue[operator];
        type ColumnType = T[typeof key];
        const typeOrmOperator = this.operatorMap<ColumnType>(operator, value);

        // console.log(operator+"  :  "+value)

        if (typeOrmOperator !== undefined) {
          // console.log(key)
          if (column.enum && column.isArray) {
            // result[key as keyof T] = Raw(
            //   (alias) => `${alias} ::text ILIKE :search`,
            //   { search: `%${value}%` },
            // ) as any;
            // result[key as keyof T] = typeOrmOperator as any;
            result[key as keyof T] = Raw(
              (alias) => `${alias} && :values`, // array overlap operator
              { values: Array.isArray(value) ? value : [...value.split(',')] }
            ) as any;
          } else {
            result[key as keyof T] = typeOrmOperator as any;
          }
        }
      }
    }
    // console.log(result)

    return result;
  };

  public singleWhere = <T extends ObjectLiteral, V>(
    filter: FilterOperatorValueDto,
    key: string,
    repo: Repository<T>
  ): FindOperator<V> | V | undefined => {
    const [[operator, value]] = Object.entries(filter);
    const column = repo.metadata.columns.find((c) => c.propertyName === key);
    if (!column) {
      return;
    }
    if (column.enum && column.isArray) {
      // return Raw((alias) => `${alias} ::text ILIKE :search`, {
      //   search: `%${value}%`,
      // });
      return Raw(
        (alias) => `${alias} && :values`, // array overlap operator
        { values: Array.isArray(value) ? value : [...value.split(',')] }
      ) as any;
    } else {
      return this.operatorMap<V>(operator, value);
    }
  };
}
