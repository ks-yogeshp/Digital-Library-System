import { PickType } from '@nestjs/swagger';
import { Types } from 'mongoose';

import { Role } from 'src/database/schemas/enums/role.enum';
import { IUserWithPenalty, UserDocument } from 'src/database/schemas/user.schema';
import {
  EmailField,
  EnumField,
  NumberField,
  ObjectFieldOptional,
  PasswordField,
  StringField,
  StringFieldOptional,
} from '../../common/decorators/field.decorators';
import { AbstractSoftDto } from './abstract-soft.dto';
import { BorrowRecordDto } from './borrow-record.dto';
import { ReservationRequestDto } from './reservation-request.dto';

export type IUserDtoWithPenalty = UserDto & { totalPenalty: number };

export class UserDto extends AbstractSoftDto {
  @StringField({
    description: 'Unique identifier for the user',
    example: '64b2f3c1b5d9a6a1e2d3f4b5',
  })
  id: string;

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

  @EnumField(() => Role, {
    description: 'Role of the user in the system',
    example: Role.STUDENT,
  })
  role: Role;

  constructor(user: UserDocument, role?: Role) {
    super(user, role);
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.role = user.role ?? Role.STUDENT;
  }
}

export class CreateUserDto extends PickType(UserDto, ['firstName', 'lastName', 'email', 'role']) {
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
  borrowingHistory?: (string | BorrowRecordDto)[];

  @ObjectFieldOptional(() => ReservationRequestDto, {
    description: 'History of reservation requests for the user',
    isArray: true,
    each: true,
  })
  reservationHistory?: (string | ReservationRequestDto)[];

  constructor(user: UserDocument) {
    super(user);
    this.borrowingHistory = user.borrowRecord?.map((borrowHistory) =>
      borrowHistory instanceof Types.ObjectId ? borrowHistory.toString() : new BorrowRecordDto(borrowHistory)
    );
    this.reservationHistory = user.reservationRequest?.map((reservationHistory) =>
      reservationHistory instanceof Types.ObjectId
        ? reservationHistory.toString()
        : new ReservationRequestDto(reservationHistory)
    );
  }
}
