import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class FilterOperatorValueDto {
  @ApiPropertyOptional({ description: 'Equals', example: 'FICTION' })
  @IsOptional()
  @IsString()
  eq?: string;

  @ApiPropertyOptional({ description: 'Greater than', example: '2020' })
  @IsOptional()
  @IsString()
  gt?: string;

  @ApiPropertyOptional({
    description: 'Greater than or equal',
    example: '2020',
  })
  @IsOptional()
  @IsString()
  gte?: string;

  @ApiPropertyOptional({ description: 'Less than', example: '2024' })
  @IsOptional()
  @IsString()
  lt?: string;

  @ApiPropertyOptional({ description: 'Less than or equal', example: '2024' })
  @IsOptional()
  @IsString()
  lte?: string;

  // @ApiPropertyOptional({ description: 'Not equals', example: 'NON_FICTION' })
  // @IsOptional()
  // @IsString()
  // not?: string;

  @ApiPropertyOptional({
    description: 'Case-sensitive like',
    example: 'Gatsby',
  })
  @IsOptional()
  @IsString()
  like?: string;

  @ApiPropertyOptional({
    description: 'Case-insensitive like',
    example: 'gatsby',
  })
  @IsOptional()
  @IsString()
  ilike?: string;

  @ApiPropertyOptional({ description: 'Is null', example: 'true' })
  @IsOptional()
  @IsIn(['true', 'false'])
  isNull?: string;

  @ApiPropertyOptional({
    description: 'In array',
    example: ['ACTIVE', 'PENDING'],
    // isArray: true,
  })
  @IsOptional()
  // @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  in?: string[];

  @ApiPropertyOptional({
    description: 'In array',
    example: ['ACTIVE', 'PENDING'],
    // isArray: true,
  })
  @IsOptional()
  // @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  any?: string[];

  @ApiPropertyOptional({
    description: 'Between two values',
    example: ['2010', '2020'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @Type(() => String)
  between?: string[];

  // @ApiPropertyOptional({
  //   description: 'Array contains value (for PostgreSQL arrays)',
  //   example: 'ADMIN',
  // })
  // @IsOptional()
  // @IsString()
  // contains?: string;
}
