import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';
import { AuthorsController } from './authors.controller';
import { BooksController } from './books.controller';
import { BorrowRecordController } from './borrow-record.controller';
import { ReservationRequestController } from './reservation-request.controller';
import { AuthorsService } from './services/authors.service';
import { BookCheckoutService } from './services/book-checkout.service';
import { BookExtendService } from './services/book-extend.service';
import { BookReserveService } from './services/book-reserve.service';
import { BookReturnService } from './services/book-return.service';
import { BooksService } from './services/books.service';
import { BorrowRecordService } from './services/borrow-record.service';
import { ReservationRequestService } from './services/reservation-request.service';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [DatabaseModule.forRoot(), forwardRef(() => AuthModule)],
  controllers: [
    AuthorsController,
    BooksController,
    UsersController,
    BorrowRecordController,
    ReservationRequestController,
  ],
  providers: [
    AuthorsService,
    BooksService,
    BookCheckoutService,
    BookReturnService,
    BookExtendService,
    BookReserveService,
    UsersService,
    BorrowRecordService,
    ReservationRequestService,
  ],
  exports: [ReservationRequestService, UsersService],
})
export class LibraryModule {}
