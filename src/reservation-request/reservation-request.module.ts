import { Module } from '@nestjs/common';
import { ReservationRequest } from './reservation-request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationRequestService } from './providers/reservation-request.service';
import { ReservationRequestController } from './reservation-request.controller';
import { Book } from 'src/books/book.entity';
import { User } from 'src/users/user.entity';

@Module({
    imports:[TypeOrmModule.forFeature([ReservationRequest,Book,User])],
    providers: [ReservationRequestService],
    exports:[ReservationRequestService],
    controllers: [ReservationRequestController]
})
export class ReservationRequestModule {}
