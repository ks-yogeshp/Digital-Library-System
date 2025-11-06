import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BorrowRecord } from 'src/borrow-record/borrow-record.entity';
import { bookStatus } from 'src/borrow-record/enums/bookStatus.enum';
import { MailService } from 'src/mail/providers/mail.service';
import { requestStatus } from 'src/reservation-request/enums/requestStatus.enum';
import { ReservationRequestService } from 'src/reservation-request/providers/reservation-request.service';
import { ReservationRequest } from 'src/reservation-request/reservation-request.entity';
import { DataSource, In, IsNull, LessThan, Not } from 'typeorm';

@Injectable()
export class SchedularService {
    private readonly logger =  new Logger(SchedularService.name);
    private readonly penalty = 10;

    constructor(

        private readonly dataSource: DataSource,

        private readonly mailService: MailService,

        private readonly reservationRequestService: ReservationRequestService,

    ){}


    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleOverDueCheck(){
        this.logger.log('Running overdue checker job...');
        await this.checkOverdueBooks();
    }

    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async handleRemainder(){
        this.logger.log('Running overdue checker job...');
        await this.sendReminders();
    }

    
    @Cron(CronExpression.EVERY_HOUR) // runs every minute
    async handleActiveExpiredReservations() {
        this.logger.log('Running expiredResrvation checker job...')
        await this.checkExpiredReservation();
    }

    public async runNow() {
        this.logger.log('Manual execution: Checking overdues and sending reminders...');
        await this.checkOverdueBooks();
        await this.sendReminders();
        await this.checkExpiredReservation();
      }


    private async checkOverdueBooks(){

        const today = new Date();
        today.setHours(0,0,0,0);

        const records = await this.dataSource.getRepository(BorrowRecord).find({
            where:{
                returnDate: IsNull(),
                bookStatus: In[bookStatus.OVERDUE,bookStatus.BORROWED]
            },
            relations:{
              user:true,
              book:true
            }
        })

        for( const record of records){
            const dueDate = new Date(record.dueDate);
            dueDate.setHours(0,0,0,0)
            if(dueDate <= today){
                const overdueDays = Math.floor(
                    (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
                );
                if(overdueDays>0){
                    if(record.bookStatus!==bookStatus.OVERDUE) record.bookStatus=bookStatus.OVERDUE;
                    record.penalty = overdueDays * this.penalty;
                    await this.dataSource.getRepository(BorrowRecord).save(record);
                    this.logger.log(
                        `Penalty updated: ${record.user.firstName} owes $${record.penalty} for "${record.book.name}"`,
                    );
                }
            }
        }

    }

    private async sendReminders(){
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        const records = await this.dataSource.getRepository(BorrowRecord).find({
          where: {
            returnDate: IsNull(),
            bookStatus: Not(bookStatus.RETURNED)
          },
          relations:{
            user:true,
            book:true
          }
        });
        let count = 0;
        for (const record of records) {
          const dueDate = new Date(record.dueDate);
          const daysDiff = Math.floor(
            (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );
    
          if (daysDiff === 0 || daysDiff < 0) {
            setTimeout(async () => {
                try {
                  // await this.mailService.sendRemainder(record, daysDiff);
                  this.logger.log(`Reminder sent to ${record.user.email}`);
                } catch (err) {
                  this.logger.error(`Failed to send reminder to ${record.user.email}`, err);
                }
              }, count*15000);
              count++;
          }
        }
    }


    public async checkExpiredReservation() {
        const now = new Date();
    
    // Find reservations whose active_until has passed and are APPROVED
        const expiredReservations = await this.dataSource.getRepository(ReservationRequest).find({
          where: {
            active_until: LessThan(now),
            requestStatus: requestStatus.APPROVED,
          },
          relations: ['book', 'user'],
        });

        for (const reservation of expiredReservations) {
          this.logger.log(`Active period expired for reservation ${reservation.id}, checking next reservation...`);
        
          reservation.requestStatus = requestStatus.EXPIRE;
          await this.dataSource.getRepository(ReservationRequest).save(reservation);

          await this.reservationRequestService.nextReservation(reservation.book);

        }
    }
    

}
