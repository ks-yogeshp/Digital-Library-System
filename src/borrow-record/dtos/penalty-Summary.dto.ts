import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Matches, Min } from "class-validator";

export class PenaltySummaryDto{

    @ApiPropertyOptional({
        description: 'Start date for filtering penalties (YYYY-MM-DD)',
        example: '2025-01-01',
        type: String,
        format: 'date',
    })
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'start must be in YYYY-MM-DD format' })
    start?:Date;

    @ApiPropertyOptional({
        description: 'End date for filtering penalties (YYYY-MM-DD)',
        example: '2025-12-31',
        type: String,
        format: 'date',
    })
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'end must be in YYYY-MM-DD format' })
    end?:Date;

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