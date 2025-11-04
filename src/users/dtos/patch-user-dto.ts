import { CreateUserDto } from "./create-user.dto";
import { PartialType, ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty } from "class-validator";

export class PatchUserDto extends PartialType(CreateUserDto){

    @ApiProperty({
        description: 'Unique identifier of the entity',
        example: 1,
        type: Number,
    })
    @IsInt({ message: 'id must be an integer' })
    @IsNotEmpty({ message: 'id should not be empty' })
    id: number;
}