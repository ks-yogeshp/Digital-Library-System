import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { differenceInCalendarDays, startOfToday } from 'date-fns';
import Redis from 'ioredis';

import { BorrowRecordRepository } from 'src/database/repositories/borrow-record.repository';
import { BookDocument } from 'src/database/schemas/book.schema';
import { BookStatus } from 'src/database/schemas/enums/book-status.enum';
import { UserDocument } from 'src/database/schemas/user.schema';

@Processor('send-reminders')
export class SendRemainderWorker extends WorkerHost {
  constructor(
    @InjectQueue('mail-queue') private mailQueue: Queue,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly borrowRecordRepository: BorrowRecordRepository
  ) {
    super();
  }

  async process(job: Job) {
    Logger.log('Processing job: ' + job.name);
    const today = startOfToday();
    const records = await this.borrowRecordRepository
      .query()
      .find({
        returnDate: null,
        bookStatus: { $ne: BookStatus.RETURNED },
      })
      .populate(['user', 'book'])
      .exec();
    for (const record of records) {
      const user = record.user as UserDocument;
      const book = record.book as BookDocument;
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
