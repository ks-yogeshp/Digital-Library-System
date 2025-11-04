import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateAuthorDto {

    @ApiProperty({
        example: 'Jane Austen',
        description: 'Full name of the author',
        minLength: 3,
        maxLength: 96,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(96)
    name: string;


    @ApiProperty({
        example: 'jane.austen@example.com',
        description: 'Unique email address of the author',
        maxLength: 96,
    })
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(96)
    email: string;
    

    @ApiPropertyOptional({
        example: 'United Kingdom',
        description: 'Country of origin of the author (optional)',
        maxLength: 96,
    })
    @IsOptional()
    @IsString()
    @MaxLength(96)
    country?: string;

}