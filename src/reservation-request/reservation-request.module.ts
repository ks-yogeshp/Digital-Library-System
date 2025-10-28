import { Module } from '@nestjs/common';
import { ReservationRequest } from './reservation-request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports:[TypeOrmModule.forFeature([ReservationRequest])]
})
export class ReservationRequestModule {}
