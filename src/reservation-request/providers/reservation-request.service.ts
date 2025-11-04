import { BadRequestException, Injectable } from '@nestjs/common';
import { Any, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReservationRequest } from '../reservation-request.entity';
import { CreateReservationRequestDto } from '../dtos/create-reservation-request.dto';
import { Book } from 'src/books/book.entity';
import { User } from 'src/users/user.entity';
import { requestStatus } from '../enums/requestStatus.enum';
import { ne, tr } from '@faker-js/faker';
import { MailService } from 'src/mail/providers/mail.service';

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
            return false;
        }

        }

}
