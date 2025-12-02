import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import Redis from 'ioredis';
import { DataSource, In, IsNull } from 'typeorm';

import { CONFIG } from 'src/config';
import { BorrowRecord } from 'src/database/entities/borrow-record.entity';
import { BookStatus } from 'src/database/entities/enums/book-status.enum';

@Processor('overdue-check')
export class OverdueWorker extends WorkerHost {
  private readonly redis: Redis;
  constructor(private readonly dataSource: DataSource) {
    super();
    this.redis = new Redis(CONFIG.REDIS_URL);
  }

  private readonly penalty = 10;
  async process(job: Job) {
    Logger.log('Processing job: ' + job.name);

    const today = startOfDay(new Date());

    const records = await this.dataSource.getRepository(BorrowRecord).find({
      where: {
        returnDate: IsNull(),
        bookStatus: In([BookStatus.OVERDUE, BookStatus.BORROWED]),
      },
      relations: {
        user: true,
        book: true,
      },
    });
    for (const record of records) {
      const dueDate = startOfDay(new Date(record.dueDate));
      const book = await record.book;
      const user = await record.user;
      if (!book) continue;
      if (!user) continue;
      if (dueDate <= today) {
        const overdueDays = differenceInCalendarDays(today, dueDate);
        if (overdueDays > 0) {
          if (record.bookStatus !== BookStatus.OVERDUE) record.bookStatus = BookStatus.OVERDUE;
          record.penalty = overdueDays * this.penalty;
          await this.dataSource.getRepository(BorrowRecord).save(record);
          Logger.log(`Penalty updated: ${user.firstName} owes $${record.penalty} for "${book.name}"`);
        }
      }
    }
    await this.redis.set(`job:lastRun:${job.name}`, new Date().toISOString());
  }
}
