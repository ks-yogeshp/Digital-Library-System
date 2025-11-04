import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReservationRequestService } from './providers/reservation-request.service';
import { CreateReservationRequestDto } from './dtos/create-reservation-request.dto';

@Controller('reservation-request')
export class ReservationRequestController {

    constructor(

        private readonly reservationRequestService: ReservationRequestService,

    ){}

    @Post()
    public createBook(
        @Body() createReservationRequestDto: CreateReservationRequestDto,
    ){
        return this.reservationRequestService.createReservation(createReservationRequestDto);
    }   
    
    @Get()
    public next(){
        return this.reservationRequestService.get();
    }

}
