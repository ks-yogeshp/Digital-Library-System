import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsNotEmpty } from "class-validator";

export class CancelReservationRequestDto{

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
    
}