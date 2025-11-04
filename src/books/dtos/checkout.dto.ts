import { ApiProperty, ApiPropertyOptional, ApiResponseProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, Max, Min } from "class-validator";

export class CheckoutDto{

    @ApiProperty({
        description: 'ID of the user borrowing the book',
        example: 1,
      })
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    userId:number;

    @ApiProperty({
        description: 'ID of the book to borrow',
        example: 101,
      })
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    bookId: number;


    @ApiPropertyOptional({
        description: 'Number of days the book will be borrowed',
        example: 14,
      })
    @IsNumber()
    @Min(1, { message: 'Days must be at least 1' })
    @Max(14, {message: 'Days must be at Most 14' })
    @IsOptional()
    days: number = 14;  

}