import { Body, Controller, Param } from '@nestjs/common';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/database/schemas/enums/role.enum';
import { PostRoute } from './../common/decorators/route.decorators';
import { BorrowRecordDto } from './dto/borrow-record.dto';
import { CheckoutReservationRequestDto } from './dto/checkout-reservation-request.dto';
import { ReservationRequestDto } from './dto/reservation-request.dto';
import { ReservationRequestService } from './services/reservation-request.service';

@Controller('reservation-request')
export class ReservationRequestController {
  constructor(private readonly reservationRequestService: ReservationRequestService) {}

  @Auth({
    roles: [Role.STUDENT],
  })
  @PostRoute('{:id}/reserve', {
    summary: 'Reserve a book',
    description: 'Reserve a book that has been requested.',
    Ok: BorrowRecordDto,
  })
  public async reserveBook(
    @Param('id') id: string,
    @Body() checkoutReservationRequestDto: CheckoutReservationRequestDto
  ) {
    const record = await this.reservationRequestService.checkoutBook(id, checkoutReservationRequestDto);
    return new BorrowRecordDto(record);
  }

  @Auth({
    roles: [Role.STUDENT],
  })
  @PostRoute('{:id}/cancel', {
    summary: 'Cancel a reservation request',
    description: 'Cancel an existing reservation request by its ID.',
    Ok: ReservationRequestDto,
  })
  public async cancelReservation(@Param('id') id: string) {
    const record = await this.reservationRequestService.cancelResrvation(id);
    return new ReservationRequestDto(record);
  }
}
