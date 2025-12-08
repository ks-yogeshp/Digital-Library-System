import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

import { CONFIG } from 'src/config';
import { BookDocument } from 'src/database/schemas/book.schema';
import { BorrowRecordDocument } from 'src/database/schemas/borrow-record.schema';
import { ReservationRequestDocument } from 'src/database/schemas/reservation-request.schema';
import { UserDocument } from 'src/database/schemas/user.schema';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    @InjectConnection()
    private readonly connection: Connection
  ) {}

  public async sendRemainder(data: { id: string; daysDiff: number }) {
    const { id, daysDiff } = data;
    const borrowRecordModel = this.connection.model<BorrowRecordDocument>('BorrowRecord');

    const borrowRecord = await borrowRecordModel
      .findById(new Types.ObjectId(id))
      .populate(['book', 'user'])
      .exec();
    if (!borrowRecord) throw new Error(`BorrowRecord with id ${id} not found`);
    const isOverdue = daysDiff < 0;
    const book = borrowRecord.book as BookDocument;
    const user = borrowRecord.user as UserDocument;
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

  public async sendReservationApproved(data: { id: string }) {
    const { id } = data;
    const reservationModel = this.connection.model<ReservationRequestDocument>('ReservationRequest');

    const reservation = await reservationModel
      .findById(new Types.ObjectId(id))
      .populate(['book', 'user'])
      .exec();
    if (!reservation) throw new Error(`ReservationRequest with id ${id} not found`);
    const book = reservation.book as BookDocument;
    const user = reservation.user as UserDocument;

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
