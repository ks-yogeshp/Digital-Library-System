import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { differenceInCalendarDays, startOfToday } from 'date-fns';
import Redis from 'ioredis';
import { DataSource, IsNull, Not } from 'typeorm';

import { CONFIG } from 'src/config';
import { BorrowRecord } from 'src/database/entities/borrow-record.entity';
import { BookStatus } from 'src/database/entities/enums/book-status.enum';

@Processor('send-reminders')
export class SendRemainderWorker extends WorkerHost {
  private readonly redis: Redis;
  constructor(
    private readonly dataSource: DataSource,
    @InjectQueue('mail-queue') private mailQueue: Queue
  ) {
    super();
    this.redis = new Redis(CONFIG.REDIS_URL);
  }

  async process(job: Job) {
    Logger.log('Processing job: ' + job.name);
    const today = startOfToday();

    const records = await this.dataSource.getRepository(BorrowRecord).find({
      where: {
        returnDate: IsNull(),
        bookStatus: Not(BookStatus.RETURNED),
      },
      relations: {
        user: true,
        book: true,
      },
    });
    for (const record of records) {
      const user = await record.user;
      const book = await record.book;
      if (!user) continue;
      if (!book) continue;
      const dueDate = new Date(record.dueDate);
      const daysDiff = differenceInCalendarDays(dueDate, today);

      if (daysDiff === 0 || daysDiff < 0) {
        try {
          await this.mailQueue.add(
            'mail-queue',
            {
              name: 'remainder',
              data: {
                id: record.id,
                daysDiff,
              },
            },
            { removeOnComplete: true, removeOnFail: true }
          );
          Logger.log(`Reminder sent to ${user.email}`);
        } catch (err) {
          Logger.error({ msg: `Failed to send reminder to ${user.email}`, err });
        }
      }
    }
    await this.redis.set(`job:lastRun:${job.name}`, new Date().toISOString());
  }
}
