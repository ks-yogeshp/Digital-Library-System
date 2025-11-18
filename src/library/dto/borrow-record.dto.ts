import { BorrowRecord } from 'src/database/entities/borrow-record.entity';
import { BookStatus } from 'src/database/entities/enums/book-status.enum';
import {
  BooleanFieldOptional,
  DateField,
  EnumField,
  NumberField,
  ObjectField,
} from '../../common/decorators/field.decorators';
import { BookDto } from './book.dto';
import { UserDto } from './user.dto';

export class BorrowRecordDto {
  @NumberField({
    description: 'Unique identifier for the borrow record',
    example: 1,
    int: true,
  })
  id: number;

  @NumberField({
    description: 'Unique identifier for the book',
    example: 1,
    int: true,
  })
  bookId?: number;

  @NumberField({
    description: 'Unique identifier for the user',
    example: 1,
    int: true,
  })
  userId?: number;

  @DateField({
    description: 'Date when the book was borrowed',
    example: '2024-01-15',
  })
  borrowDate: Date;

  @DateField({
    description: 'Due date for returning the book',
    example: '2024-02-15',
  })
  dueDate: Date;

  @DateField({
    description: 'Date when the book was returned',
    example: '2024-02-10',
  })
  returnDate?: Date;

  @NumberField({
    description: 'Penalty amount for late return',
    example: 5,
    isPositive: true,
  })
  penalty?: number;

  @BooleanFieldOptional({
    description: 'Indicates if the penalty has been paid',
    example: true,
  })
  penaltyPaid?: boolean;

  @NumberField({
    description: 'Number of times the borrow period has been extended',
    example: 1,
    int: true,
    minimum: 0,
    maximum: 3,
  })
  extensionCount: number;

  @EnumField(() => BookStatus, {
    description: 'Current status of the book',
    example: BookStatus.BORROWED,
  })
  bookStatus: BookStatus;

  constructor(borrowRecord: BorrowRecord) {
    this.id = borrowRecord.id;
    this.userId = borrowRecord.userId;
    this.bookId = borrowRecord.bookId;
    this.borrowDate = borrowRecord.borrowDate;
    this.dueDate = borrowRecord.dueDate;
    this.penalty = borrowRecord.penalty;
    this.penaltyPaid = borrowRecord.penaltyPaid;
    this.extensionCount = borrowRecord.extensionCount;
    this.bookStatus = borrowRecord.bookStatus;
    this.returnDate = borrowRecord.returnDate;
  }
}

export class DetailedBorrowRecordDto extends BorrowRecordDto {
  @ObjectField(() => BookDto, {
    description: 'Details of the borrowed book',
  })
  book: BookDto;

  @ObjectField(() => UserDto, {
    description: 'Details of the user who borrowed the book',
  })
  user: UserDto;

  constructor(borrowRecord: BorrowRecord) {
    super(borrowRecord);
  }

  static async toDto(borrowRecord: BorrowRecord) {
    const detailedDto = new DetailedBorrowRecordDto(borrowRecord);
    delete detailedDto.bookId;
    delete detailedDto.userId;
    const book = await borrowRecord.book;
    const user = await borrowRecord.user;
    detailedDto.book = new BookDto(book);
    detailedDto.user = new UserDto(user);
    return detailedDto;
  }
}
