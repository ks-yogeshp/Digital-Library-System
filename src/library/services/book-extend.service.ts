import { BadRequestException, Injectable } from '@nestjs/common';
import { add, differenceInCalendarDays, startOfDay } from 'date-fns';

import { BookStatus } from 'src/database/entities/enums/book-status.enum';
import { BorrowRecordRepository } from 'src/database/repositories/borrow-record.repository';
import { ExtendDto } from '../dto/extend.dto';

@Injectable()
export class BookExtendService {
  constructor(private readonly borrowRecordRepository: BorrowRecordRepository) {}

  public async extendBook(id: number, extendDto: ExtendDto) {
    const record = await this.borrowRecordRepository.findOne({
      where: {
        book: {
          id: id,
        },
        user: {
          id: extendDto.userId,
        },
        bookStatus: BookStatus.BORROWED,
      },
    });
    if (!record) {
      throw new BadRequestException('No borrow record found for this user and book');
    }
    const now = startOfDay(new Date());
    const dueDate = startOfDay(record.dueDate);
    const overdueDays = differenceInCalendarDays(now, dueDate);
    if (overdueDays <= -2 && record.extensionCount < 3) {
      record.extensionCount++;
      record.dueDate = add(dueDate, { days: extendDto.days });
      await this.borrowRecordRepository.save(record);
      return record;
    } else {
      throw new BadRequestException(
        'Extension not allowed (too close to due date or max extensions reached)'
      );
    }
  }
}
