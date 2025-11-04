import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BorrowRecord } from 'src/borrow-record/borrow-record.entity';
import { User } from 'src/users/user.entity';
import { Any, In, Repository } from 'typeorm';
import { Book } from '../book.entity';
import { ReturnDto } from '../dtos/return.dto';
import { bookStatus } from 'src/borrow-record/enums/bookStatus.enum';
import { availabilityStatus } from '../enums/availibityStatus.enum';
import { DataSource } from 'typeorm';
import { ReservationRequestService } from 'src/reservation-request/providers/reservation-request.service';
import { tr } from '@faker-js/faker';

@Injectable()
export class ReturnProvider {

    constructor(

        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,

        @InjectRepository(BorrowRecord)
        private readonly borrowRecordRepository: Repository<BorrowRecord>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly reservationRequestSerivce: ReservationRequestService,

        private readonly dataSource: DataSource,

    ){}    


    public async bookReturn(returnDto: ReturnDto){
        
        let record = await this.borrowRecordRepository.findOne({
            where:{
                book:{
                    id:returnDto.bookId
                },
                user:{
                    id:returnDto.userId
                },
                bookStatus:Any([bookStatus.BORROWED,bookStatus.OVERDUE])
            },
            relations:{
                book:true,
                user:true
            }
        })
        if(!record){
             throw new BadRequestException('No borrow record found for this user and book');
        }else{

            const returnDate = new Date();
            returnDate.setHours(0,0,0,0);

            record.returnDate = returnDate;
            record.bookStatus = bookStatus.RETURNED;
            record.penaltyPaid = true;

            const reservationAvailable = await this.reservationRequestSerivce.nextReservation(record.book)

            await this.dataSource.transaction(async (manager) => {
                if(!reservationAvailable){
                    record.book.availabilityStatus = availabilityStatus.AVAILABLE;
                    await manager.save(record.book);
                }
                await manager.save(record);
              });

            return record;

            
        }
    }

}
