import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BorrowRecord } from 'src/borrow-record/borrow-record.entity';
import { User } from 'src/users/user.entity';
import { Any, Repository } from 'typeorm';
import { Book } from '../book.entity';
import { ExtendDto } from '../dtos/extend.dto';
import { bookStatus } from 'src/borrow-record/enums/bookStatus.enum';

@Injectable()
export class ExtendProvider {

    constructor(

        @InjectRepository(BorrowRecord)
        private readonly borrowRecordRepository: Repository<BorrowRecord>,

    ){}    

    public async extendBook(extendDto: ExtendDto){

       let record = await this.borrowRecordRepository.findOne({
            where:{
                book:{
                    id:extendDto.bookId
                },
                user:{
                    id:extendDto.userId
                },
                bookStatus:bookStatus.BORROWED
            }
        })
        if(!record){
            throw new BadRequestException('No borrow record found for this user and book');
        }
        const now = new Date();
        now.setHours(0,0,0,0);
        const dueDate = new Date(record.dueDate);
        const overdueDays = Math.floor((now.getTime()-dueDate.getTime())/(1000*60*60*24)) + 1; 
        if(overdueDays <= -2 && record.extensionCount < 2){
            dueDate.setDate(dueDate.getDate() + extendDto.days);
            record.extensionCount++;
            record.dueDate = dueDate;
            return await this.borrowRecordRepository.save(record);
        }
        else{
            throw new BadRequestException('Extension not allowed (too close to due date or max extensions reached)');
        }
    }

    
}
