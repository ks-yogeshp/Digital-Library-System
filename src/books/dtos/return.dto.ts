import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsNotEmpty } from "class-validator";

export class ReturnDto{

    @ApiProperty({
        description: 'ID of the book to borrow',
        example: 101,
    })
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    bookId: number;

    @ApiProperty({
      description: 'ID of the book to borrow',
      example: 101,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  userId: number;    

}