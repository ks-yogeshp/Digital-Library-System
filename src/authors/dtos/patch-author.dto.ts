import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateAuthorDto } from "./create-author.dto";
import { IsInt, IsNotEmpty } from "class-validator";

export class PatchAuthorDto extends PartialType(CreateAuthorDto){

    @ApiProperty({
        description: 'Unique identifier of the entity',
        example: 1,
        type: Number,
    })
    @IsInt({ message: 'id must be an integer' })
    @IsNotEmpty({ message: 'id should not be empty' })
    id: number;
}

