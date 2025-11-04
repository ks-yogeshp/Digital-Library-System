import { category } from "../enums/category.enum";
import { ArrayNotEmpty, IsArray, IsEnum, IsInt, IsISBN, IsNotEmpty, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateBookDto{

    @ApiProperty({
        description: 'The title of the book',
        example: 'The Great Gatsby',
      })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(96)
    name: string;
    
    @ApiProperty({
        description: 'The ISBN of the book (International Standard Book Number)',
        example: '978-3-16-148410-0',
      })
    @IsISBN()
    @IsNotEmpty()
    ISBN: string;
    
    @ApiProperty({
        description: 'List of categories the book belongs to',
        enum: category,
        isArray: true,
        required:false,
        example: [category.FICTION, category.MYSTERY],
      })
    @IsArray()
    @IsOptional()
    @IsEnum(category, { each: true })
    category?: category[];
    
    @ApiProperty({
        description: 'Array of author IDs associated with the book',
        example: [1, 2, 3],
        type: [Number]
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    authorIds: number[];
    
    @ApiProperty({
        description: 'Year the book was published',
        example: 2021,
      })
    @IsInt()
    @Min(0)
    yearOfPublication: number;
    
    @ApiProperty({
        description: 'Version or edition of the book',
        example: '2nd Edition',
      })
    @IsString()
    @IsNotEmpty()
    version: string;
    
    // @ApiProperty({
    //     description: 'Availability status of the book',
    //     enum: availabilityStatus,
    //     example: availabilityStatus.AVAILABLE,
    //   })
    // @IsEnum(availabilityStatus)
    // availabilityStatus?: availabilityStatus;

}