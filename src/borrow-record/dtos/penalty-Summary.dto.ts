import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, Matches, Min } from "class-validator";

export class PenaltySummaryDto{

    @ApiPropertyOptional({
        description: 'Start date for filtering penalties (YYYY-MM-DD)',
        example: '2025-01-01',
        type: String,
        format: 'date',
    })
    @IsOptional()
    @IsDateString({}, { message: 'startDate must be a valid date string (YYYY-MM-DD)' })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'start must be in YYYY-MM-DD format' })
    start?:string;

    @ApiPropertyOptional({
        description: 'End date for filtering penalties (YYYY-MM-DD)',
        example: '2025-12-31',
        type: String,
        format: 'date',
    })
    @IsOptional()
    @IsDateString({}, { message: 'startDate must be a valid date string (YYYY-MM-DD)' })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'end must be in YYYY-MM-DD format' })
    end?:string;

    @ApiPropertyOptional({
      description: 'Number of user',
      example: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?:number;
}