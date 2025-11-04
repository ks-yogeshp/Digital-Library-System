import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { BooksController } from './books.controller';
import { BooksService } from './providers/books.service';
import { QueryModule } from 'src/common/query/query.module';
import { CheckoutProvider } from './providers/checkout.provider';
import { BorrowRecord } from 'src/borrow-record/borrow-record.entity';
import { User } from 'src/users/user.entity';
import { ReturnProvider } from './providers/return.provider';
import { ExtendProvider } from './providers/extend.provider';
import { ReservationRequest } from 'src/reservation-request/reservation-request.entity';
import { ReservationRequestModule } from 'src/reservation-request/reservation-request.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Book,BorrowRecord,User]),
        QueryModule,
        ReservationRequestModule
    ],
    controllers: [BooksController],
    providers: [BooksService, CheckoutProvider, ReturnProvider, ExtendProvider]
})
export class BooksModule {}
