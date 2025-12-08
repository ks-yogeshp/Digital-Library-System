import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Types } from 'mongoose';

import { RequestStatus } from 'src/database/schemas/enums/request-status.enum';
import { Role } from 'src/database/schemas/enums/role.enum';
import { ReservationRequestDocument } from 'src/database/schemas/reservation-request.schema';
import { DateField, EnumField, StringField } from '../../common/decorators/field.decorators';
import { AbstractSoftDto } from './abstract-soft.dto';
import { BookDto } from './book.dto';
import { UserDto } from './user.dto';

export class ReservationRequestDto extends AbstractSoftDto {
  @StringField({
    description: 'Unique identifier for the reservation request',
    example: '64b2f3c1b5d9a6a1e2d3f4b5',
  })
  id: string;

  @ApiProperty({
    description: 'The book associated with the borrow record. Can be an ID or a full object.',
    oneOf: [{ type: 'string', example: '64e2f3c1b5d9a6a1e2d3f4b5' }, { $ref: getSchemaPath(BookDto) }],
  })
  book?: string | BookDto;

  @ApiProperty({
    description: 'The book associated with the borrow record. Can be an ID or a full object.',
    oneOf: [{ type: 'string', example: '64e2f3c1b5d9a6a1e2d3f4b5' }, { $ref: getSchemaPath(UserDto) }],
  })
  user?: string | UserDto;

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

  constructor(reservationRequest: ReservationRequestDocument, role?: Role) {
    super(reservationRequest, role);
    this.id = reservationRequest.id;
    this.user = reservationRequest.user
      ? reservationRequest.user instanceof Types.ObjectId
        ? reservationRequest.user.toString()
        : new UserDto(reservationRequest.user, role)
      : undefined;
    this.book = reservationRequest.book
      ? reservationRequest.book instanceof Types.ObjectId
        ? reservationRequest.book.toString()
        : new BookDto(reservationRequest.book, role)
      : undefined;
    this.requestDate = reservationRequest.requestDate;
    this.requestStatus = reservationRequest.requestStatus;
    this.active_until = reservationRequest.active_until;
  }
}
