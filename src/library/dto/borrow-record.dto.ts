import { Types } from 'mongoose';

import { BorrowRecordDocument } from 'src/database/schemas/borrow-record.schema';
import { BookStatus } from 'src/database/schemas/enums/book-status.enum';
import { Role } from 'src/database/schemas/enums/role.enum';
import {
  BooleanFieldOptional,
  DateField,
  EnumField,
  NumberField,
  StringField,
  StringFieldOptional,
} from '../../common/decorators/field.decorators';
import { AbstractSoftDto } from './abstract-soft.dto';
import { BookDto } from './book.dto';
import { UserDto } from './user.dto';

export class BorrowRecordDto extends AbstractSoftDto {
  @StringField({
    description: 'Unique identifier for the borrow record',
    example: '64b2f3c1b5d9a6a1e2d3f4b5',
  })
  id: string;

  @StringFieldOptional({
    description: 'Unique identifier for the book',
    example: '64b2f3c1b5d9a6a1e2d3f4b5',
  })
  book?: string | BookDto;

  @StringFieldOptional({
    description: 'Unique identifier for the user',
    example: '64b2f3c1b5d9a6a1e2d3f4b5',
  })
  user?: string | UserDto;

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

  constructor(borrowRecord: BorrowRecordDocument, role?: Role) {
    super(borrowRecord, role);
    this.id = borrowRecord.id;
    this.user = borrowRecord.user
      ? borrowRecord.user instanceof Types.ObjectId
        ? borrowRecord.user.toString()
        : new UserDto(borrowRecord.user, role)
      : undefined;
    this.book = borrowRecord.book
      ? borrowRecord.book instanceof Types.ObjectId
        ? borrowRecord.book.toString()
        : new BookDto(borrowRecord.book, role)
      : undefined;
    this.borrowDate = borrowRecord.borrowDate;
    this.dueDate = borrowRecord.dueDate;
    this.penalty = borrowRecord.penalty;
    this.penaltyPaid = borrowRecord.penaltyPaid;
    this.extensionCount = borrowRecord.extensionCount;
    this.bookStatus = borrowRecord.bookStatus;
    this.returnDate = borrowRecord.returnDate;
  }
}
