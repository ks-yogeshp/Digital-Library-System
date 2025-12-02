import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsInt, IsObject, IsOptional, IsPositive, IsString, Min, validateSync } from 'class-validator';

import { FilterOperatorValueDto } from './filter-operator-value.dto';

export class QueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Search keyword (applies to name, title, etc.)',
    example: 'gatsby',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Field to sort results by',
    example: 'yearOfPublication',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order (ASC or DESC)',
    example: 'ASC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'Filters object. (e.g., filters[category][eq]=FICTION)',
    type: 'object',
    example: {
      category: { eq: 'FICTION' },
      yearOfPublication: { gt: 2020 },
    },
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  @Transform(
    ({ value }) => {
      if (typeof value !== 'object' || value === null) {
        return value;
      }
      const transformed = {};
      try {
        for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            const instance = plainToInstance(FilterOperatorValueDto, value[key]);

            const errors = validateSync(instance, {
              forbidNonWhitelisted: true,
              whitelist: true,
            });
            if (errors.length > 0) {
              const errorMessages = errors
                .map((e) => (e.constraints ? Object.values(e.constraints) : []))
                .flat()
                .join(', ');

              throw new Error(`Invalid filter for '${key}': ${errorMessages}`);
            }
            transformed[key] = instance;
          }
        }
        return value;
      } catch (e) {
        throw new BadRequestException(e.message);
      }
    },
    { toClassOnly: true }
  )
  filters?: Record<string, FilterOperatorValueDto>;
}
