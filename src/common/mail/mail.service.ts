import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

import { CONFIG } from 'src/config';
import { BorrowRecord } from 'src/database/entities/borrow-record.entity';
import { ReservationRequest } from 'src/database/entities/reservation-request.entity';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendRemainder(borrowRecord: BorrowRecord, daysDiff: number) {
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
      console.log(`Reminder sent to ${user.email}`);
    } catch (error) {
      console.error(`Failed to send reminder to ${user.email}`, error);
    }
  }

  public async sendReservationApproved(reservation: ReservationRequest) {
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
}
