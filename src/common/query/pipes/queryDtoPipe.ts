import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Model } from 'mongoose';

import { FilterOperatorValueDto } from 'src/common/dtos/filter-operator-value.dto';
import { QueryDto } from 'src/common/dtos/query.dto';

@Injectable()
export class QueryDtoPipe<T> implements PipeTransform {
  constructor(private readonly entity: { new (): T } | Model<any>) {}

  transform(value: any) {
    const dto = plainToInstance(QueryDto, value);

    // Validate page, limit, search, etc.
    const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length > 0) {
      const messages = errors
        .map((e) => (e.constraints ? Object.values(e.constraints) : []))
        .flat()
        .join(', ');
      throw new BadRequestException(messages);
    }

    // Validate filters keys
    if (dto.filters) {
      const allowedKeys = this.getEntityKeys();
      for (const key of Object.keys(dto.filters)) {
        if (!allowedKeys.includes(key)) {
          throw new BadRequestException(
            `Invalid filter key '${key}'. Allowed keys: ${allowedKeys.join(', ')}`
          );
        }

        // Optional: validate each filter value DTO
        const instance = plainToInstance(FilterOperatorValueDto, dto.filters[key]);
        const filterErrors = validateSync(instance, { whitelist: true, forbidNonWhitelisted: true });
        if (filterErrors.length > 0) {
          const messages = filterErrors
            .map((e) => (e.constraints ? Object.values(e.constraints) : []))
            .flat()
            .join(', ');
          throw new BadRequestException(`Invalid filter for '${key}': ${messages}`);
        }
      }
    }

    return dto;
  }

  private getEntityKeys(): string[] {
    // If Mongoose model, get schema paths
    if ('schema' in this.entity) {
      return Object.keys(this.entity.schema.paths);
    }

    // If TypeORM class, get property names (metadata)
    return Object.getOwnPropertyNames(new (this.entity as any)());
  }
}
