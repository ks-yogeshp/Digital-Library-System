import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CONFIG } from 'src/config';
import { BorrowRecord } from 'src/database/entities/borrow-record.entity';
import { ReservationRequest } from 'src/database/entities/reservation-request.entity';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly dataSource: DataSource
  ) {}

  public async sendRemainder(data: { id: number; daysDiff: number }) {
    const { id, daysDiff } = data;
    const borrowRecord = await this.dataSource.getRepository(BorrowRecord).findOneOrFail({
      where: { id },
    });
    const isOverdue = daysDiff < 0;
    const book = await borrowRecord.book;
    const user = await borrowRecord.user;
    const subject = isOverdue ? `Overdue Notice: "${book.name}"` : `Reminder: "${book.name}" is due today`;
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject,
        template: 'remainder',
        context: {
          subject,
          userName: user.firstName,
          bookTitle: book.name,
          dueDate: borrowRecord.dueDate,
          isOverdue,
          libraryUrl: `${CONFIG.APP_URL}`,
        },
      });
      Logger.log(`Reminder sent to ${user.email}`);
    } catch (error) {
      Logger.error(`Failed to send reminder to ${user.email}`, error);
    }
  }

  public async sendReservationApproved(data: { id: number }) {
    const { id } = data;
    const reservation = await this.dataSource.getRepository(ReservationRequest).findOneOrFail({
      where: { id },
    });
    const book = await reservation.book;
    const user = await reservation.user;

    const subject = `Your reservation for "${book.name}" is approved!`;
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject,
        template: 'reservation-approved',
        context: {
          subject,
          userName: user.firstName,
          bookTitle: book.name,
          activeUntil: reservation.active_until,
          libraryUrl: `${CONFIG.APP_URL}`,
        },
      });
      Logger.log({ msg: `Reservation approval sent to ${user.email}` });
    } catch (error) {
      Logger.error({ msg: `Failed to send reservation approval to ${user.email}`, error });
    }
  }
  public async sendMonthlyReport(data: { to: string; buffer: any; reportMonth: string }) {
    const { to, buffer, reportMonth } = data;
    const file = Buffer.from(buffer);
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Monthly Borrow Records Report',
        template: 'monthly-report',
        context: {
          month: new Date().toLocaleString('default', { month: 'long' }),
          libraryUrl: CONFIG.APP_URL,
        },
        attachments: [
          {
            filename: `monthly-borrow-report-${reportMonth}.xlsx`,
            content: file,
          },
        ],
      });
      Logger.log(`Monthly borrow report emailed to ${to}`);
    } catch (error) {
      Logger.error(`Failed to send monthly report to ${to}`, error);
    }
  }
}
