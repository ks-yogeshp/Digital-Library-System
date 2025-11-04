import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { BorrowRecord } from 'src/borrow-record/borrow-record.entity';
import { ReservationRequest } from 'src/reservation-request/reservation-request.entity';

@Injectable()
export class MailService {

    constructor(

        private readonly mailerService: MailerService,

    ){}

    public async sendRemainder(borrowRecord: BorrowRecord, daysDiff:number){

        const isOverdue = daysDiff < 0;
        const subject = isOverdue
          ? `Overdue Notice: "${borrowRecord.book.name}"`
          : `Reminder: "${borrowRecord.book.name}" is due today`;
        try {
            await this.mailerService.sendMail({
                to: borrowRecord.user.email,
                from: `DLS Team <remainder@dls.com>`,
                subject,
                template:'remainder',
                context:{
                    subject,
                    userName: borrowRecord.user.firstName,
                    bookTitle: borrowRecord.book.name,
                    dueDate: borrowRecord.dueDate,
                    isOverdue,
                    libraryUrl: 'https://your-library-system.com',
                }
            })
            console.log(`Reminder sent to ${borrowRecord.user.email}`);
        } catch (error) {
          console.error(`Failed to send reminder to ${borrowRecord.user.email}`, error);
        }

    }


    public async sendReservationApproved(reservation: ReservationRequest) {
        const subject = `Your reservation for "${reservation.book.name}" is approved!`;
        try {
            await this.mailerService.sendMail({
                to: reservation.user.email,
                from: `DLS Team <notifications@dls.com>`,
                subject,
                template:'reservation-approved', // create a template for this email
                context: {
                    subject,
                    userName: reservation.user.firstName,
                    bookTitle: reservation.book.name,
                    activeUntil: reservation.active_until, // when they need to pick it up
                    libraryUrl: 'https://your-library-system.com',
                }
            });
            console.log(`Reservation approval sent to ${reservation.user.email}`);
        } catch (error) {
            console.error(`Failed to send reservation approval to ${reservation.user.email}`, error);
        }
    }


}
