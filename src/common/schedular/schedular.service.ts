import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { DataSource, In, IsNull, LessThan, Not } from 'typeorm';

import { BorrowRecord } from 'src/database/entities/borrow-record.entity';
import { BookStatus } from 'src/database/entities/enums/book-status.enum';
import { RequestStatus } from 'src/database/entities/enums/request-status.enum';
import { ReservationRequest } from 'src/database/entities/reservation-request.entity';
import { ReservationRequestService } from 'src/library/services/reservation-request.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SchedularService {
  private readonly penalty = 10;

  constructor(
    private readonly dataSource: DataSource,

    private readonly mailService: MailService,

    private readonly reservationRequestService: ReservationRequestService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleOverDueCheck() {
    Logger.log('Running overdue checker job...');
    await this.checkOverdueBooks();
  }

  @Cron(CronExpression.EVERY_DAY_AT_11AM)
  async handleRemainder() {
    Logger.log('Running remainder job...');
    await this.sendReminders();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleActiveExpiredReservations() {
    Logger.log('Running expiredResrvation checker job...');
    await this.checkExpiredReservation();
  }

  public async runNow() {
    Logger.log('Manual execution: Checking overdues and sending reminders...');
    await this.checkOverdueBooks();
    await this.sendReminders();
    await this.checkExpiredReservation();
  }

  private async checkOverdueBooks() {
    const today = startOfDay(new Date());

    const records = await this.dataSource.getRepository(BorrowRecord).find({
      where: {
        returnDate: IsNull(),
        bookStatus: In[(BookStatus.OVERDUE, BookStatus.BORROWED)],
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
  }

  private async sendReminders() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
    let count = 0;
    for (const record of records) {
      const user = await record.user;
      const book = await record.book;
      if (!user) continue;
      if (!book) continue;
      const dueDate = new Date(record.dueDate);
      const daysDiff = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0 || daysDiff < 0) {
        setTimeout(() => {
          try {
            // await this.mailService.sendRemainder(record, daysDiff);
            Logger.log(`Reminder sent to ${user.email}`);
          } catch (err) {
            Logger.error({ msg: `Failed to send reminder to ${user.email}`, err });
          }
        }, count * 15);
        count++;
      }
    }
  }

  public async checkExpiredReservation() {
    const now = new Date();

    const expiredReservations = await this.dataSource.getRepository(ReservationRequest).find({
      where: {
        active_until: LessThan(now),
        requestStatus: RequestStatus.APPROVED,
      },
      relations: ['book', 'user'],
    });

    for (const reservation of expiredReservations) {
      const book = await reservation.book;
      const user = await reservation.user;
      if (!book) continue;
      if (!user) continue;
      Logger.log(`Active period expired for reservation ${reservation.id}, checking next reservation...`);

      reservation.requestStatus = RequestStatus.EXPIRE;
      await this.dataSource.transaction(async (manager) => {
        await manager.save(reservation);
        await this.reservationRequestService.nextReservation(book, manager);
      });
    }
  }
}
