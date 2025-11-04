import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsInt, IsPositive, Min, IsString, IsObject } from "class-validator";

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
      description:
        'Filters object — can include any field to filter by (e.g., category, availabilityStatus)',
      example: {
        category: 'FICTION',
        availabilityStatus: 'AVAILABLE',
        yearOfPublication: 2023,
      },
    })
    @IsOptional()
    @IsObject()
    filters?: Record<string, any>;
  }