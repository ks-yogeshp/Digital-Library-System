import { RequestStatus } from 'src/database/entities/enums/request-status.enum';
import { ReservationRequest } from 'src/database/entities/reservation-request.entity';
import { DateField, EnumField, NumberField, ObjectField } from '../../common/decorators/field.decorators';
import { BookDto } from './book.dto';
import { UserDto } from './user.dto';

export class ReservationRequestDto {
  @NumberField({
    description: 'Unique identifier for the reservation request',
    example: 1,
    int: true,
    isPositive: true,
  })
  id: number;

  @NumberField({
    description: 'Unique identifier for the book',
    example: 1,
    int: true,
  })
  bookId?: number;

  @NumberField({
    description: 'Unique identifier for the user',
    example: 1,
    int: true,
  })
  userId?: number;

  @DateField({
    description: 'Date when the reservation request was made',
    example: '2024-01-15',
  })
  requestDate: Date;

  @EnumField(() => RequestStatus, {
    description: 'Current status of the reservation request',
    example: RequestStatus.PENDING,
  })
  requestStatus: RequestStatus;

  @DateField({
    description: 'Date until which the reservations request is active',
    example: '2024-02-15T00:00:00Z',
  })
  active_until: Date;

  constructor(reservationRequest?: ReservationRequest) {
    if (reservationRequest) {
      this.id = reservationRequest.id;
      this.bookId = reservationRequest.bookId;
      this.userId = reservationRequest.userId;
      this.requestDate = reservationRequest.requestDate;
      this.requestStatus = reservationRequest.requestStatus;
      this.active_until = reservationRequest.active_until;
    }
  }
}

export class DetailedReservationRequestDto extends ReservationRequestDto {
  @ObjectField(() => BookDto, {
    description: 'Book associated with the reservation request',
  })
  book: BookDto;

  @ObjectField(() => UserDto, {
    description: 'User who made the reservation request',
  })
  user: UserDto;

  constructor(reservationRequest: ReservationRequest) {
    super(reservationRequest);
  }

  static async toDto(reservationRequest: ReservationRequest) {
    const detailedDto = new DetailedReservationRequestDto(reservationRequest);
    delete detailedDto.bookId;
    delete detailedDto.userId;
    const book = await reservationRequest.book;
    const user = await reservationRequest.user;
    detailedDto.book = new BookDto(book);
    detailedDto.user = new UserDto(user);
    return detailedDto;
  }
}
