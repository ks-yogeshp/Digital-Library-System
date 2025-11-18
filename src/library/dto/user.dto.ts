import { PickType } from '@nestjs/swagger';

import { IUserWithPenalty, User } from 'src/database/entities/user.entity';
import {
  EmailField,
  NumberField,
  ObjectFieldOptional,
  PasswordField,
  StringField,
  StringFieldOptional,
} from '../../common/decorators/field.decorators';
import { BorrowRecordDto } from './borrow-record.dto';
import { ReservationRequestDto } from './reservation-request.dto';

export type IUserDtoWithPenalty = UserDto & { totalPenalty: number };

export class UserDto {
  @NumberField({
    description: 'Unique identifier for the user',
    example: 1,
    int: true,
    isPositive: true,
  })
  id: number;

  @StringField({
    description: 'First name of the user',
    example: 'John',
  })
  firstName: string;

  @StringFieldOptional({
    description: 'Last name of the user',
    example: 'Doe',
  })
  lastName?: string;

  @EmailField({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  constructor(user: User) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
  }
}

export class CreateUserDto extends PickType(UserDto, ['firstName', 'lastName', 'email']) {
  @PasswordField({
    description: 'Password for the user account',
    example: 'StrongP@ssw0rd!',
  })
  password: string;
}

export class UpdateUserDto extends PickType(UserDto, ['firstName', 'lastName']) {}

export class UserDtoWithPenalty extends UserDto {
  @NumberField({
    description: 'Total penalty amount for the user',
    example: 15,
    isPositive: true,
  })
  totalPenalty: number;
  constructor(user: IUserWithPenalty) {
    super(user);
    this.totalPenalty = user.totalPenalty;
  }
}

export class DetailedUserDto extends UserDto {
  @ObjectFieldOptional(() => BorrowRecordDto, {
    description: 'History of borrowing records for the user',
    isArray: true,
    each: true,
  })
  borrowingHistory?: BorrowRecordDto[];

  @ObjectFieldOptional(() => ReservationRequestDto, {
    description: 'History of reservation requests for the user',
    isArray: true,
    each: true,
  })
  reservationHistory?: ReservationRequestDto[];

  constructor(user: User) {
    super(user);
  }

  static async toDto(user: User) {
    const userDto = new DetailedUserDto(user);
    const borrowingHistory = user.borrowingHistory
      ? (await user.borrowingHistory).map((borrowingHistory) => new BorrowRecordDto(borrowingHistory))
      : undefined;
    const reservationHistory = user.reservationHistory
      ? (await user.reservationHistory).map(
          (reservationHistory) => new ReservationRequestDto(reservationHistory)
        )
      : undefined;
    userDto.borrowingHistory = borrowingHistory;
    userDto.reservationHistory = reservationHistory;
    return userDto;
  }
}
