import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsISBN, IsNotEmpty, IsString } from 'class-validator';

import { Book, IBookWihtBorrowCount } from 'src/database/entities/book.entity';
import { AvailabilityStatus } from 'src/database/entities/enums/availibity-status.enum';
import { Category } from 'src/database/entities/enums/category.enum';
import {
  EnumField,
  NumberField,
  ObjectFieldOptional,
  StringField,
} from '../../common/decorators/field.decorators';
import { AuthorDto } from './author.dto';
import { BorrowRecordDto } from './borrow-record.dto';
import { ReservationRequestDto } from './reservation-request.dto';

export type IBookDtoWihtBorrowCount = BookDto & { authorNames: string[]; borrowCount: number };

export class BookDto {
  @NumberField({
    description: 'Unique identifier for the book',
    example: 1,
    int: true,
  })
  id: number;

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

  constructor(book: Book) {
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
    example: [1, 2, 3],
    int: true,
    each: true,
    isArray: true,
    unique: true,
  })
  authorIds: number[];
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
    example: [1, 2, 3],
    int: true,
    each: true,
    isArray: true,
    unique: true,
  })
  authorsIds: number[];
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
  authors?: AuthorDto[];

  @ObjectFieldOptional(() => BorrowRecordDto, {
    description: 'Borrowing history of the book',
    isArray: true,
    each: true,
  })
  borrowingHistory?: BorrowRecordDto[];

  @ObjectFieldOptional(() => ReservationRequestDto, {
    description: 'History of reservation requests for the user',
    isArray: true,
    each: true,
  })
  reservationHistory?: ReservationRequestDto[];

  constructor(book: Book) {
    super(book);
  }

  static async toDto(book: Book) {
    const bookDto = new DetailedBookDto(book);
    const author = book.authors ? (await book.authors).map((author) => new AuthorDto(author)) : undefined;
    const borrowingHistory = book.borrowingHistory
      ? (await book.borrowingHistory).map((borrowingHistory) => new BorrowRecordDto(borrowingHistory))
      : undefined;
    const reservationHistory = book.reservationHistory
      ? (await book.reservationHistory).map((reservation) => new ReservationRequestDto(reservation))
      : undefined;
    bookDto.authors = author;
    bookDto.borrowingHistory = borrowingHistory;
    bookDto.reservationHistory = reservationHistory;
    return bookDto;
  }
}
