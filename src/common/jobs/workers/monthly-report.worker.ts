import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import * as ExcelJS from 'exceljs';
import Redis from 'ioredis';
import { Between, DataSource } from 'typeorm';

import { CONFIG } from 'src/config';
import { BorrowRecord } from 'src/database/entities/borrow-record.entity';
import { Role } from 'src/database/entities/enums/role.enum';
import { User } from 'src/database/entities/user.entity';

@Processor('monthly-reports')
export class MonthlyReportWorker extends WorkerHost {
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
    const startOfLastMonth = startOfMonth(subMonths(new Date(), 1));
    const endOfLastMonth = endOfMonth(subMonths(new Date(), 1));
    const records = await this.dataSource.getRepository(BorrowRecord).find({
      where: {
        borrowDate: Between(startOfLastMonth, endOfLastMonth),
      },
      relations: {
        user: true,
        book: true,
      },
      withDeleted: true,
      order: {
        borrowDate: 'ASC',
      },
    });
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
      const user = await record.user;
      const book = await record.book;
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
    const admins = await this.dataSource.getRepository(User).find({
      where: {
        role: Role.ADMIN,
      },
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
