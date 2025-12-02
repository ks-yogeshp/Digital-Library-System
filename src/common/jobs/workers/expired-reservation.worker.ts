import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource, LessThan } from 'typeorm';

import { RequestStatus } from 'src/database/entities/enums/request-status.enum';
import { ReservationRequest } from 'src/database/entities/reservation-request.entity';
import { ReservationRequestService } from 'src/library/services/reservation-request.service';

@Processor('expired-reservations')
export class ExpiredReservationWorker extends WorkerHost {
  constructor(
    private readonly dataSource: DataSource,
    private readonly reservationRequestService: ReservationRequestService
  ) {
    super();
  }

  async process(job: Job) {
    Logger.log('Processing job: ' + job.name);
    const now = new Date();
    const expiredReservations = await this.dataSource.getRepository(ReservationRequest).find({
      where: {
        active_until: LessThan(now),
        requestStatus: RequestStatus.APPROVED,
      },
      relations: ['book', 'user'],
    });

    for (const reservation of expiredReservations) {
      const book = await reservation.book;
      const user = await reservation.user;
      if (!book) continue;
      if (!user) continue;
      Logger.log(`Active period expired for reservation ${reservation.id}, checking next reservation...`);

      reservation.requestStatus = RequestStatus.EXPIRE;
      await this.dataSource.transaction(async (manager) => {
        await manager.save(reservation);
        await this.reservationRequestService.nextReservation(book, manager);
      });
    }
  }
}
