import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Any } from 'typeorm';

import { AvailabilityStatus } from 'src/database/entities/enums/availibity-status.enum';
import { RequestStatus } from 'src/database/entities/enums/request-status.enum';
import { ReservationRequest } from 'src/database/entities/reservation-request.entity';
import { BookRepository } from 'src/database/repositories/book.repository';
import { BorrowRecordRepository } from 'src/database/repositories/borrow-record.repository';
import { ReservationRequestRepository } from 'src/database/repositories/reservation-request.repository';
import { UserRepository } from 'src/database/repositories/user.repository';
import { CreateReservationRequestDto } from '../dto/create-reservation-request.dto';

@Injectable()
export class BookReserveService {
  constructor(
    private readonly borrowRecordRepository: BorrowRecordRepository,
    private readonly reservationRequestRepository: ReservationRequestRepository,
    private readonly bookRepository: BookRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async createReservation(id, createReservationRequestDto: CreateReservationRequestDto) {
    const request = await this.reservationRequestRepository.findOne({
      where: {
        book: {
          id: id,
        },
        user: {
          id: createReservationRequestDto.userId,
        },
        requestStatus: Any([RequestStatus.APPROVED, RequestStatus.PENDING]),
      },
    });
    if (request) {
      throw new BadRequestException('Reservation request already exists for this book and user');
    }
    const bookDetail = await this.bookRepository.findOneBy({
      id: id,
    });
    const userDetail = await this.userRepository.findOneBy({
      id: createReservationRequestDto.userId,
    });
    if (!bookDetail || !userDetail)
      throw new BadRequestException('Invalid book or user. Please check the IDs.');

    if (bookDetail.availabilityStatus === AvailabilityStatus.AVAILABLE) {
      throw new BadRequestException(`The book "${bookDetail.name}" is currently available for borrowing.`);
    }
    const newRequst = new ReservationRequest();
    newRequst.bookId = bookDetail.id;
    newRequst.userId = userDetail.id;

    await this.reservationRequestRepository.save(newRequst);

    const reservation = await this.reservationRequestRepository.findOne({
      where: {
        id: newRequst.id,
      },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation;
  }
}
