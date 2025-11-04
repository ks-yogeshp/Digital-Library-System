import { Module } from '@nestjs/common';
import { SchedularService } from './providers/schedular.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowRecord } from 'src/borrow-record/borrow-record.entity';
import { ReservationRequestModule } from 'src/reservation-request/reservation-request.module';

@Module({
  providers: [SchedularService],
  imports:[TypeOrmModule.forFeature([BorrowRecord]),ReservationRequestModule]
})
export class SchedularModule {}
