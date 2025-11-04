import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEmpty, IsOptional, IsEmail, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto{

    @ApiProperty({
        description: 'First name of the user',
        example: 'John',
    })
    @IsString()
    @IsNotEmpty({ message: 'First name is required' })
    @MinLength(3)
    @MaxLength(96)
    firstName: string;


    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe',
        required: false,
    })
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(96)
    lastName?: string;


    @ApiProperty({
        description: 'Email address of the user',
        example: 'john.doe@example.com',
    })
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    @MaxLength(96)
    email: string;



    @ApiProperty({
        description: 'Password for the user account',
        example: 'StrongPassword@123',
    })
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8)
    @MaxLength(96)
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
        message:
          'Minimum eight characters, at least one letter, one number and one special character',
      })
    password: string;

}