import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsISBN, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

import { BookDocument, IBookWihtBorrowCount } from 'src/database/schemas/book.schema';
import { AvailabilityStatus } from 'src/database/schemas/enums/availibity-status.enum';
import { Category } from 'src/database/schemas/enums/category.enum';
import { Role } from 'src/database/schemas/enums/role.enum';
import {
  EnumField,
  NumberField,
  ObjectFieldOptional,
  StringField,
} from '../../common/decorators/field.decorators';
import { AuthorDto } from './author.dto';
import { BorrowRecordDto } from './borrow-record.dto';
import { MetadataSoftDto } from './metadata-soft.dto';
import { ReservationRequestDto } from './reservation-request.dto';

export type IBookDtoWihtBorrowCount = BookDto & { authorNames: string[]; borrowCount: number };

export class BookDto extends MetadataSoftDto {
  @StringField({
    description: 'Unique identifier for the book',
    example: '64b2f3c1b5d9a6a1e2d3f4b5',
  })
  id: string;

  @StringField({
    description: 'Name of the book',
    example: 'The Great Gatsby',
  })
  name: string;

  @ApiProperty({
    description: 'The ISBN of the book (International Standard Book Number)',
    example: '978-3-16-148410-0',
  })
  @IsString()
  @IsISBN()
  @IsNotEmpty()
  ISBN: string;

  @EnumField(() => Category, {
    description: 'Category or categories of the book',
    example: [Category.FICTION, Category.HISTORY],
    isArray: true,
    notEmpty: true,
    each: true,
  })
  category: Category[];

  @NumberField({
    description: 'Year the book was published',
    example: 2020,
    int: true,
    isPositive: true,
  })
  yearOfPublication: number;

  @StringField({
    description: 'Version or edition of the book',
    example: 'First Edition',
  })
  version: string;

  @EnumField(() => AvailabilityStatus, {
    description: 'Availability status of the book',
    example: AvailabilityStatus.AVAILABLE,
  })
  availabilityStatus: AvailabilityStatus;

  constructor(book: BookDocument, role?: Role) {
    super(book, role);
    this.id = book.id;
    this.name = book.name;
    this.ISBN = book.ISBN;
    this.category = book.category;
    this.yearOfPublication = book.yearOfPublication;
    this.version = book.version;
    this.availabilityStatus = book.availabilityStatus;
  }
}

export class CreateBookDto extends PickType(BookDto, [
  'name',
  'ISBN',
  'category',
  'yearOfPublication',
  'version',
]) {
  @NumberField({
    description: 'Array of author IDs',
    example: ['64b2f3c1b5d9a6a1e2d3f4b5', '64b2f3c1b5d9a6a1e2d3f4b6', '64b2f3c1b5d9a6a1e2d3f4b7'],
    int: true,
    each: true,
    isArray: true,
    unique: true,
  })
  authorIds: string[];
}

export class UpdateBookDto extends PickType(BookDto, [
  'name',
  'ISBN',
  'category',
  'yearOfPublication',
  'version',
]) {
  @NumberField({
    description: 'Array of author IDs',
    example: ['64b2f3c1b5d9a6a1e2d3f4b5', '64b2f3c1b5d9a6a1e2d3f4b6', '64b2f3c1b5d9a6a1e2d3f4b7'],
    int: true,
    each: true,
    isArray: true,
    unique: true,
  })
  authorIds: string[];
}

export class BookDtoWithBorrowCount extends BookDto {
  @StringField({
    description: 'Names of the authors of the book',
    example: ['Author One', 'Author Two'],
    isArray: true,
    each: true,
  })
  authorNames: string[];

  @NumberField({
    description: 'Number of times the book has been borrowed',
    example: 10,
    int: true,
    isPositive: true,
  })
  borrowCount: number;

  constructor(book: IBookWihtBorrowCount) {
    super(book);
    this.borrowCount = book.borrowCount;
    this.authorNames = book.authorNames;
  }
}

export class DetailedBookDto extends BookDto {
  @ObjectFieldOptional(() => AuthorDto, {
    description: 'List of authors associated with the book',
    isArray: true,
    each: true,
  })
  authors?: (string | AuthorDto)[];

  @ObjectFieldOptional(() => BorrowRecordDto, {
    description: 'Borrowing history of the book',
    isArray: true,
    each: true,
  })
  borrowingHistory?: (string | BorrowRecordDto)[];

  @ObjectFieldOptional(() => ReservationRequestDto, {
    description: 'History of reservation requests for the user',
    isArray: true,
    each: true,
  })
  reservationHistory?: (string | ReservationRequestDto)[];

  constructor(book: BookDocument, role?: Role) {
    super(book, role);
    this.authors = book.authors?.map((author) =>
      author instanceof Types.ObjectId ? author.toString() : new AuthorDto(author, role)
    );
    this.borrowingHistory = book.borrowHistory?.map((borrowHistory) =>
      borrowHistory instanceof Types.ObjectId
        ? borrowHistory.toString()
        : new BorrowRecordDto(borrowHistory, role)
    );
    this.reservationHistory = book.reservationHistory?.map((reservationHistory) =>
      reservationHistory instanceof Types.ObjectId
        ? reservationHistory.toString()
        : new ReservationRequestDto(reservationHistory, role)
    );
  }
}
