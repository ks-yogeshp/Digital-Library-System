import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsObject, IsOptional, IsPositive, IsString, Min } from 'class-validator';

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
  filters?: Record<string, FilterOperatorValueDto>;
}
