import { Repository } from 'typeorm';

import { DatabaseRepository } from '../decorators/repository.decorator';
import { ReservationRequest } from '../entities/reservation-request.entity';

@DatabaseRepository(ReservationRequest)
export class ReservationRequestRepository extends Repository<ReservationRequest> {}
