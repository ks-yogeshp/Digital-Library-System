import { Body, Controller, Param, ParseIntPipe } from '@nestjs/common';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/database/entities/enums/role.enum';
import { PostRoute } from './../common/decorators/route.decorators';
import { DetailedBorrowRecordDto } from './dto/borrow-record.dto';
import { CheckoutReservationRequestDto } from './dto/checkout-reservation-request.dto';
import { DetailedReservationRequestDto } from './dto/reservation-request.dto';
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
    // Ok: DetailedBorrowRecordDto,
  })
  public async reserveBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() checkoutReservationRequestDto: CheckoutReservationRequestDto
  ) {
    const record = await this.reservationRequestService.checkoutBook(id, checkoutReservationRequestDto);
    return DetailedBorrowRecordDto.toDto(record);
  }

  @Auth({
    roles: [Role.STUDENT],
  })
  @PostRoute('{:id}/cancel', {
    summary: 'Cancel a reservation request',
    description: 'Cancel an existing reservation request by its ID.',
    // Ok: DetailedReservationRequestDto,
  })
  public async cancelReservation(@Param('id', ParseIntPipe) id: number) {
    const record = await this.reservationRequestService.cancelResrvation(id);
    return DetailedReservationRequestDto.toDto(record);
  }
}
