import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsOptional, IsInt, Min, Max, IsDateString, Matches, IsArray, IsEnum, IsPositive } from "class-validator";
import { category } from "src/books/enums/category.enum";

export class BookActivitySummaryDto{

    @ApiPropertyOptional({
        description: 'Filter by year (e.g., 2025)',
        example: 2025,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'year must be an integer' })
    @Min(1900, { message: 'year must be >= 1900' })
    year?: number;

    @ApiPropertyOptional({
        description: 'Filter by month (1–12)',
        example: 5,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'month must be an integer' })
    @Min(1, { message: 'month must be between 1 and 12' })
    @Max(12, { message: 'month must be between 1 and 12' })
    month?: number;

    @ApiPropertyOptional({
        description: 'Start date for filtering (YYYY-MM-DD)',
        example: '2025-01-01',
        type: String,
        format: 'date',
    })
    @IsOptional()
    @IsDateString({}, { message: 'startDate must be a valid date string (YYYY-MM-DD)' })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'start must be in YYYY-MM-DD format' })
    startDate?: string;

    @ApiPropertyOptional({
        description: 'End date for filtering penalties (YYYY-MM-DD)',
        example: '2025-12-31',
        type: String,
        format: 'date',
    })
    @IsOptional()
    @IsDateString({}, { message: 'endDate must be a valid date string (YYYY-MM-DD)' })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'end must be in YYYY-MM-DD format' })
    endDate?: string;

 
    @ApiPropertyOptional({
        description: 'Filter by category IDs (comma-separated list)',
        enum: category,
        isArray: true,
        example: [category.FICTION, category.MYSTERY],
    })
    @Transform(({ value }) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        return value.split(','); // split comma-separated string into array
    })
    @IsArray({ message: 'categoryIds must be an array of numbers' })
    @IsOptional()
    @IsEnum(category, { each: true })
    categoryIds?: category[];

    @ApiPropertyOptional({
        description: 'Limit number of top borrowed books (e.g., 10)',
        example: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'limit must be an integer' })
    @IsPositive({ message: 'limit must be greater than 0' })
    limit?: number;
}