import { PickType } from '@nestjs/swagger';

import { Author } from 'src/database/entities/author.entity';
import { Role } from 'src/database/entities/enums/role.enum';
import {
  EmailField,
  NumberField,
  ObjectFieldOptional,
  StringField,
  StringFieldOptional,
} from '../../common/decorators/field.decorators';
import { BookDto } from './book.dto';
import { MetadataSoftDto } from './metadata-soft.dto';

export class AuthorDto extends MetadataSoftDto {
  @NumberField({
    description: 'Unique identifier for the user',
    example: 1,
    int: true,
  })
  id: number;

  @StringField({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  name: string;

  @EmailField({
    description: 'Email address of the user',
    example: 'john@example.com',
  })
  email: string;

  @StringFieldOptional({
    description: 'Country of the user',
    example: 'USA',
  })
  country?: string;

  constructor(author: Author, role?: Role) {
    super(author, role);
    this.id = author.id;
    this.name = author.name;
    this.email = author.email;
    this.country = author.country;
  }
}

export class CreateAuthorDto extends PickType(AuthorDto, ['name', 'email', 'country']) {}

export class UpdateAuthorDto extends PickType(AuthorDto, ['name', 'country']) {}

export class DetailedAuthorDto extends AuthorDto {
  @ObjectFieldOptional(() => BookDto, {
    description: 'List of books associated with the user',
    isArray: true,
    each: true,
  })
  books?: BookDto[];

  constructor(author: Author, role?: Role) {
    super(author, role);
  }

  static async toDto(author: Author, role?: Role): Promise<DetailedAuthorDto> {
    const detailedAuthorDto = new DetailedAuthorDto(author, role);
    const books = await author.books;
    if (books) {
      detailedAuthorDto.books = books.map((book) => new BookDto(book, role));
    }
    return detailedAuthorDto;
  }
}
