import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../book.entity';
import { availabilityStatus } from '../enums/availibityStatus.enum';
import { BorrowRecord } from 'src/borrow-record/borrow-record.entity';
import { CheckoutDto } from '../dtos/checkout.dto';
import { User } from 'src/users/user.entity';
import { bookStatus } from 'src/borrow-record/enums/bookStatus.enum';

@Injectable()
export class CheckoutProvider {

    constructor(

        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,

        @InjectRepository(BorrowRecord)
        private readonly borrowRecordRepository: Repository<BorrowRecord>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

    ){}


    public async checkout(checkoutDto: CheckoutDto){

        let bookDetail = await this.bookRepository.findOneBy({id: checkoutDto.bookId});
        let userDetail = await this.userRepository.findOneBy({id: checkoutDto.userId})
        if(!bookDetail || !userDetail){
            throw new BadRequestException('Invalid book or user. Please check the IDs.');
        }
        if(bookDetail.availabilityStatus === availabilityStatus.UNAVAILABLE){
            throw new BadRequestException(`The book "${bookDetail.name}" is currently unavailable for borrowing.`);
        }else{
            bookDetail.availabilityStatus = availabilityStatus.UNAVAILABLE;
            bookDetail = await this.bookRepository.save(bookDetail);
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const dueDate = new Date(now);
            dueDate.setDate(dueDate.getDate() + checkoutDto.days);

            // const now = new Date();
            // now.setHours(0, 0, 0, 0);
            // now.setDate(now.getDate() - 14)
            // const dueDate = new Date(now);
            // dueDate.setDate(dueDate.getDate() + checkoutDto.days);

            let record = this.borrowRecordRepository.create({
                book: bookDetail,
                user: userDetail,
                borrowDate: now,
                dueDate: dueDate,
            })
            // console.log(record)
            return await this.borrowRecordRepository.save(record);
        }




    }

}
