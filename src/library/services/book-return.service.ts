import { BadRequestException, Injectable } from '@nestjs/common';
import { Any, DataSource } from 'typeorm';

import { BookStatus } from 'src/database/entities/enums/book-status.enum';
import { BorrowRecordRepository } from 'src/database/repositories/borrow-record.repository';
import { ReservationRequestService } from 'src/library/services/reservation-request.service';
import { ReturnDto } from '../dto/return.dto';

@Injectable()
export class BookReturnService {
  constructor(
    private readonly borrowRecordRepository: BorrowRecordRepository,

    private readonly reservationRequestSerivce: ReservationRequestService,

    private readonly dataSource: DataSource
  ) {}

  public async bookReturn(id: number, returnDto: ReturnDto) {
    const record = await this.borrowRecordRepository.findOne({
      where: {
        book: {
          id: id,
        },
        user: {
          id: returnDto.userId,
        },
        bookStatus: Any([BookStatus.BORROWED, BookStatus.OVERDUE]),
      },
      relations: {
        book: true,
        user: true,
      },
    });
    if (!record) {
      throw new BadRequestException('No borrow record found for this user and book');
    } else {
      const returnDate = new Date();

      record.returnDate = returnDate;
      record.bookStatus = BookStatus.RETURNED;
      record.penaltyPaid = true;
      await this.dataSource.transaction(async (manager) => {
        await this.reservationRequestSerivce.nextReservation(await record.book, manager);
        await manager.save(record);
      });

      return record;
    }
  }
}
