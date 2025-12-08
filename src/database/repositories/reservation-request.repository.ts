import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MongoRepository } from '../decorators/repository.decorator';
import { ReservationRequest, ReservationRequestSchema } from '../schemas/reservation-request.schema';

@MongoRepository(ReservationRequest.name, ReservationRequestSchema)
export class ReservationRequestRepository {
  constructor(
    @InjectModel(ReservationRequest.name)
    private readonly reservationRequestModel: Model<ReservationRequest>
  ) {}

  query() {
    return this.reservationRequestModel;
  }
}
