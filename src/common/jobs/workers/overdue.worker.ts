import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import Redis from 'ioredis';

import { BorrowRecordRepository } from 'src/database/repositories/borrow-record.repository';
import { BookDocument } from 'src/database/schemas/book.schema';
import { BookStatus } from 'src/database/schemas/enums/book-status.enum';
import { UserDocument } from 'src/database/schemas/user.schema';

@Processor('overdue-check')
export class OverdueWorker extends WorkerHost {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly borrowRecordRepository: BorrowRecordRepository
  ) {
    super();
  }

  private readonly penalty = 10;
  async process(job: Job) {
    Logger.log('Processing job: ' + job.name);

    const today = startOfDay(new Date());
    const records = await this.borrowRecordRepository
      .query()
      .find({
        returnDate: null,
        bookStatus: { $in: [BookStatus.OVERDUE, BookStatus.BORROWED] },
      })
      .populate(['user', 'book'])
      .exec();
    for (const record of records) {
      const dueDate = startOfDay(new Date(record.dueDate));
      const book = record.book as BookDocument;
      const user = record.user as UserDocument;
      if (!book) continue;
      if (!user) continue;
      if (dueDate <= today) {
        const overdueDays = differenceInCalendarDays(today, dueDate);
        if (overdueDays > 0) {
          if (record.bookStatus !== BookStatus.OVERDUE) record.bookStatus = BookStatus.OVERDUE;
          record.penalty = overdueDays * this.penalty;
          await record.save();
          Logger.log(`Penalty updated: ${user.firstName} owes $${record.penalty} for "${book.name}"`);
        }
      }
    }
    await this.redis.set(`job:lastRun:${job.name}`, new Date().toISOString());
  }
}
