import { BadRequestException, Body, Injectable } from '@nestjs/common';
import { Any, DataSource, LessThan, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReservationRequest } from '../reservation-request.entity';
import { CreateReservationRequestDto } from '../dtos/create-reservation-request.dto';
import { Book } from 'src/books/book.entity';
import { User } from 'src/users/user.entity';
import { requestStatus } from '../enums/requestStatus.enum';
import { MailService } from 'src/mail/providers/mail.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { CheckoutReservationRequestDto } from '../dtos/checkout-reservation-request.dto';
import { BorrowRecord } from 'src/borrow-record/borrow-record.entity';
import { CancelReservationRequestDto } from '../dtos/cancel-reservation-request.dto';
import { availabilityStatus } from 'src/books/enums/availibityStatus.enum';

@Injectable()
export class ReservationRequestService {

    constructor(

        @InjectRepository(ReservationRequest)
        private readonly reservationRequestRepository: Repository<ReservationRequest>,
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly mailService: MailService,

        private readonly dataSource: DataSource

    ){}

    public async createReservation(createReservationRequestDto: CreateReservationRequestDto){

        const request = await this.reservationRequestRepository.find({
            where:{
                book:{
                    id:createReservationRequestDto.bookId,
                },
                user:{
                    id:createReservationRequestDto.userId,
                },
                requestStatus:Any([requestStatus.APPROVED,requestStatus.PENDING])
            }
        })
        if(request.length>0){
            throw new BadRequestException('Reservation request already exists for this book and user');
        }
        let bookDetail = await this.bookRepository.findOneBy({id: createReservationRequestDto.bookId});
        let userDetail = await this.userRepository.findOneBy({id: createReservationRequestDto.userId})
        if(!bookDetail || !userDetail){
            throw new BadRequestException();
        }
        const newRequst = this.reservationRequestRepository.create({
            book:bookDetail,
            user:userDetail,
        })

        return await this.reservationRequestRepository.save(newRequst);

    }

    public async get(){
        return await this.reservationRequestRepository.find();
    }

    public async nextReservation(book:Book){

        const nextReservation = await this.reservationRequestRepository.findOne({
            where:{
                book:book,
                requestStatus:requestStatus.PENDING
            },
            order:{
                requestDate:'ASC'
            },
            relations:{
                user:true,
                book:true
            },
        })
        if(nextReservation){
            const activeUntil = new Date();
            activeUntil.setDate(activeUntil.getDate()+1)

            nextReservation.requestStatus = requestStatus.APPROVED
            nextReservation.active_until = activeUntil;
            await this.mailService.sendReservationApproved(nextReservation);
            await this.reservationRequestRepository.save(nextReservation);
            return true
        }
        else{
            book.availabilityStatus = availabilityStatus.AVAILABLE;
            await this.bookRepository.save(book);
        }
    }

    public async checkoutBook(
       checkoutReservationRequestDto: CheckoutReservationRequestDto
    ){
        const now = new Date();
        const reservation = await this.reservationRequestRepository.findOne({
            where:{
                book:{
                    id:checkoutReservationRequestDto.bookId
                },
                user:{
                    id:checkoutReservationRequestDto.userId
                },
                requestStatus: requestStatus.APPROVED,
                active_until: MoreThan(now)
            },relations:{
                user:true,
                book:true
            }
        })
        if(!reservation){
            throw new BadRequestException();
        }
        now.setHours(0, 0, 0, 0);
        now.setDate(now.getDate() - 14)
        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + checkoutReservationRequestDto.days);
        let record = this.dataSource.getRepository(BorrowRecord).create({
            book: reservation.book,
            user: reservation.user,
            borrowDate: now,
            dueDate: dueDate,
        })
        await this.dataSource.transaction(async (manager) => {
            await manager.save(record)
            reservation.requestStatus= requestStatus.FULFILLED;
            await manager.save(reservation);
        });

        return record;
    }

    public async cancelResrvation(cancelResvationRequestDto: CancelReservationRequestDto){
        const reservation = await this.reservationRequestRepository.findOne({
            where:{
                book:{
                    id:cancelResvationRequestDto.bookId
                },
                user:{
                    id:cancelResvationRequestDto.userId
                },
                requestStatus: Any[requestStatus.APPROVED,requestStatus.PENDING],
            },relations:{
                user:true,
                book:true
            }
        })
        if(!reservation){
            throw new BadRequestException();
        }
        if(reservation.requestStatus === requestStatus.APPROVED){
            this.nextReservation(reservation.book);
        }
        reservation.requestStatus = requestStatus.CANCELLED;
        return await this.reservationRequestRepository.save(reservation);
    }

}
