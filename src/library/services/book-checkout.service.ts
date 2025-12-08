import { BadRequestException, Injectable } from '@nestjs/common';
import { add, startOfDay } from 'date-fns';
import { Connection, Types } from 'mongoose';

import { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { BookRepository } from 'src/database/repositories/book.repository';
import { BorrowRecordRepository } from 'src/database/repositories/borrow-record.repository';
import { UserRepository } from 'src/database/repositories/user.repository';
import { BorrowRecord, BorrowRecordDocument } from 'src/database/schemas/borrow-record.schema';
import { AvailabilityStatus } from '../../database/schemas/enums/availibity-status.enum';
import { CheckoutDto } from '../dto/checkout.dto';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class BookCheckoutService {
  constructor(
    private readonly bookRepository: BookRepository,

    private readonly userRepository: UserRepository,

    private readonly borrowRecordRepository: BorrowRecordRepository,

    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  public async checkout(
    id: string,
    user: IActiveUser,
    checkoutDto: CheckoutDto
  ): Promise<BorrowRecordDocument> {
    console.log('Checkout Service Invoked');
    const bookDetail = await this.bookRepository.query().findById(new Types.ObjectId(id));
    const userDetail = await this.userRepository.query().findById(user.sub);
    console.log('Book Detail and User Detail fetched');
    if (!bookDetail || !userDetail) {
      throw new BadRequestException('Invalid book or user. Please check the IDs.');
    }

    if (bookDetail.availabilityStatus === AvailabilityStatus.UNAVAILABLE) {
      throw new BadRequestException(`The book "${bookDetail.name}" is currently unavailable for borrowing.`);
    }

    bookDetail.availabilityStatus = AvailabilityStatus.UNAVAILABLE;
    const now = startOfDay(new Date());

    const newRecord = new BorrowRecord();
    newRecord.book = bookDetail._id;
    newRecord.user = userDetail._id;
    newRecord.borrowDate = now;
    newRecord.dueDate = add(now, { days: checkoutDto.days });
    let insertedDoc: BorrowRecordDocument;
    const session = await this.connection.startSession();
    try {
      insertedDoc = await session.withTransaction(async () => {
        await bookDetail.save({ session });
        return await this.borrowRecordRepository.query().insertOne(newRecord, { session });
      });
    } finally {
      await session.endSession();
    }
    return insertedDoc;
  }
}
