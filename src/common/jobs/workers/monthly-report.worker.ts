import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import * as ExcelJS from 'exceljs';
import Redis from 'ioredis';

import { BorrowRecordRepository } from 'src/database/repositories/borrow-record.repository';
import { BookDocument } from 'src/database/schemas/book.schema';
import { Role } from 'src/database/schemas/enums/role.enum';
import { UserDocument } from 'src/database/schemas/user.schema';

@Processor('monthly-reports')
export class MonthlyReportWorker extends WorkerHost {
  constructor(
    @InjectQueue('mail-queue') private mailQueue: Queue,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly borrowRecordRepository: BorrowRecordRepository
  ) {
    super();
  }

  async process(job: Job) {
    Logger.log('Processing job: ' + job.name);
    const startOfLastMonth = startOfMonth(subMonths(new Date(), 1));
    const endOfLastMonth = endOfMonth(subMonths(new Date(), 1));
    // with deleted
    const records = await this.borrowRecordRepository
      .query()
      .find({
        borrowDate: {
          $gte: startOfLastMonth,
          $lte: endOfLastMonth,
        },
      })
      .populate(['user', 'book'])
      .sort({ borrowDate: 1 })
      .exec();
    if (records.length <= 0) {
      Logger.log('No borrow records for last month, skipping report.');
      return;
    }
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Borrow Records');
    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'User', key: 'user', width: 30 },
      { header: 'Book', key: 'book', width: 30 },
      { header: 'Borrow Date', key: 'borrowDate', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 15 },
      { header: 'Return Date', key: 'returnDate', width: 15 },
      { header: 'Penalty', key: 'penalty', width: 10 },
      { header: 'Status', key: 'status', width: 15 },
    ];
    for (const record of records) {
      const user = record.user as UserDocument;
      const book = record.book as BookDocument;
      const userDeleted = user.deletedAt ? ' (Deleted)' : '';
      const bookDeleted = book.deletedAt ? ' (Deleted)' : '';
      sheet.addRow([
        record.id,
        user.firstName + ' ' + user.lastName + userDeleted,
        book.name + bookDeleted,
        record.borrowDate,
        record.dueDate,
        record.returnDate ? record.returnDate : '',
        record.penalty || 0,
        record.bookStatus,
      ]);
    }
    const buffer = await workbook.xlsx.writeBuffer();
    const admins: UserDocument[] = await this.borrowRecordRepository.query().find({
      role: Role.ADMIN,
    });
    for (const admin of admins) {
      await this.mailQueue.add(
        'mail-queue',
        {
          name: 'monthly-reports',
          data: {
            to: admin.email,
            buffer: buffer,
            reportMonth: (startOfLastMonth.getMonth() + 1).toString(),
          },
        },
        { removeOnComplete: true, removeOnFail: true }
      );
    }
    Logger.log('Generating and sending monthly reports...');
    await this.redis.set(`job:lastRun:${job.name}`, new Date().toISOString());
  }
}
