import { PartialType, ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty } from "class-validator";
import { CreateBookDto } from "./creat-book.dto";

export class PatchBookDto extends PartialType(CreateBookDto){

    @ApiProperty({
        description: 'Unique identifier of the entity',
        example: 1,
        type: Number,
    })
    @IsInt({ message: 'id must be an integer' })
    @IsNotEmpty({ message: 'id should not be empty' })
    id: number;
}