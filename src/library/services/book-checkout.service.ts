import { BadRequestException, Injectable } from '@nestjs/common';
import { add, startOfDay } from 'date-fns';
import { DataSource } from 'typeorm';

import { BorrowRecord } from 'src/database/entities/borrow-record.entity';
import { BookRepository } from 'src/database/repositories/book.repository';
import { BorrowRecordRepository } from 'src/database/repositories/borrow-record.repository';
import { UserRepository } from 'src/database/repositories/user.repository';
import { AvailabilityStatus } from '../../database/entities/enums/availibity-status.enum';
import { CheckoutDto } from '../dto/checkout.dto';

@Injectable()
export class BookCheckoutService {
  constructor(
    private readonly bookRepository: BookRepository,

    private readonly borrowRecordRepository: BorrowRecordRepository,

    private readonly userRepository: UserRepository,

    private readonly dataSource: DataSource
  ) {}

  public async checkout(id: number, checkoutDto: CheckoutDto) {
    const bookDetail = await this.bookRepository.findOneBy({ id });
    const userDetail = await this.userRepository.findOneBy({
      id: checkoutDto.userId,
    });

    if (!bookDetail || !userDetail) {
      throw new BadRequestException('Invalid book or user. Please check the IDs.');
    }

    if (bookDetail.availabilityStatus === AvailabilityStatus.UNAVAILABLE) {
      throw new BadRequestException(`The book "${bookDetail.name}" is currently unavailable for borrowing.`);
    }

    bookDetail.availabilityStatus = AvailabilityStatus.UNAVAILABLE;
    const now = startOfDay(new Date());

    const newRecord = new BorrowRecord();
    newRecord.bookId = bookDetail.id;
    newRecord.userId = userDetail.id;
    newRecord.borrowDate = now;
    newRecord.dueDate = add(now, { days: checkoutDto.days });

    await this.dataSource.transaction(async (manager) => {
      await manager.save(bookDetail);
      await manager.save(newRecord);
    });

    return newRecord;
  }
}
