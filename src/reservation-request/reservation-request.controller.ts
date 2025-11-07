import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReservationRequestService } from './providers/reservation-request.service';
import { CreateReservationRequestDto } from './dtos/create-reservation-request.dto';
import { CheckoutReservationRequestDto } from './dtos/checkout-reservation-request.dto';
import { CancelReservationRequestDto } from './dtos/cancel-reservation-request.dto';

@Controller('reservation-request')
export class ReservationRequestController {

    constructor(

        private readonly reservationRequestService: ReservationRequestService,

    ){}

    @Post('reserve')
    public createReservationResquest(
        @Body() createReservationRequestDto: CreateReservationRequestDto,
    ){
        return this.reservationRequestService.createReservation(createReservationRequestDto);
    }   

    @Post('checkout')
    public reserveBook( 
        @Body() checkoutReservationRequestDto: CheckoutReservationRequestDto 
    ){
        return this.reservationRequestService.checkoutBook(checkoutReservationRequestDto);
    }

    @Post('cancel')
    public cancelReservation(
        @Body() cancelReservationRequestDto: CancelReservationRequestDto 
    ){
        return this.reservationRequestService.cancelResrvation(cancelReservationRequestDto);
    }


}
