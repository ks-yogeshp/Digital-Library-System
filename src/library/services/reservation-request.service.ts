import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { add, startOfDay } from 'date-fns';
import { Any, DataSource, EntityManager, MoreThan } from 'typeorm';

import { MailService } from 'src/common/mail/mail.service';
import { Book } from 'src/database/entities/book.entity';
import { BorrowRecord } from 'src/database/entities/borrow-record.entity';
import { AvailabilityStatus } from 'src/database/entities/enums/availibity-status.enum';
import { ReservationRequestRepository } from 'src/database/repositories/reservation-request.repository';
import { RequestStatus } from '../../database/entities/enums/request-status.enum';
import { CheckoutReservationRequestDto } from '../dto/checkout-reservation-request.dto';

@Injectable()
export class ReservationRequestService {
  constructor(
    private readonly reservationRequestRepository: ReservationRequestRepository,

    private readonly mailService: MailService,

    private readonly dataSource: DataSource
  ) {}

  public async get() {
    return await this.reservationRequestRepository.find();
  }

  public async nextReservation(book: Book, manager: EntityManager) {
    const nextReservation = await this.reservationRequestRepository.findOne({
      where: {
        book: book,
        requestStatus: RequestStatus.PENDING,
      },
      order: {
        requestDate: 'ASC',
      },
      relations: {
        user: true,
        book: true,
      },
    });
    if (nextReservation) {
      const activeUntil = new Date();
      activeUntil.setDate(activeUntil.getDate() + 1);

      nextReservation.requestStatus = RequestStatus.APPROVED;
      nextReservation.active_until = activeUntil;
      await this.mailService.sendReservationApproved(nextReservation);
      await manager.save(nextReservation);
    } else {
      book.availabilityStatus = AvailabilityStatus.AVAILABLE;
      await manager.save(book);
    }
  }

  public async checkoutBook(id: number, checkoutReservationRequestDto: CheckoutReservationRequestDto) {
    const now = new Date();
    const reservation = await this.reservationRequestRepository.findOne({
      where: {
        id: id,
        requestStatus: RequestStatus.APPROVED,
        active_until: MoreThan(now),
      },
      relations: {
        user: true,
        book: true,
      },
    });
    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    const newRecord = new BorrowRecord();
    newRecord.bookId = reservation.bookId;
    newRecord.userId = reservation.userId;
    newRecord.borrowDate = startOfDay(now);
    newRecord.dueDate = add(now, { days: checkoutReservationRequestDto.days });

    await this.dataSource.transaction(async (manager) => {
      await manager.save(newRecord);
      reservation.requestStatus = RequestStatus.FULFILLED;
      await manager.save(reservation);
    });
    const record = await this.dataSource.getRepository(BorrowRecord).findOne({
      where: { id: newRecord.id },
    });
    if (!record) throw new NotFoundException('BorrowRecord not Found');
    return record;
  }

  public async cancelResrvation(id: number) {
    const reservation = await this.reservationRequestRepository.findOne({
      where: {
        id: id,
        requestStatus: Any[(RequestStatus.APPROVED, RequestStatus.PENDING)],
      },
      relations: {
        user: true,
        book: true,
      },
    });
    if (!reservation) {
      throw new BadRequestException();
    }
    await this.dataSource.transaction(async (manager) => {
      if (reservation.requestStatus === RequestStatus.APPROVED) {
        await this.nextReservation(await reservation.book, manager);
      }
      reservation.requestStatus = RequestStatus.CANCELLED;
      await manager.save(reservation);
    });

    return reservation;
  }
}
