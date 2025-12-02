import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';

import { BorrowRecord } from 'src/database/entities/borrow-record.entity';
import { AbstractSoftEntity } from './abstract-soft.entity';
import { Role } from './enums/role.enum';
import { ReservationRequest } from './reservation-request.entity';

export type IUserWithPenalty = User & { totalPenalty: number };

@Entity()
export class User extends AbstractSoftEntity {
  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 96,
    nullable: true,
  })
  lastName?: string;

  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 96,
    nullable: true,
  })
  @Exclude()
  password?: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.STUDENT,
  })
  role?: Role;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @Exclude()
  googleId?: string;

  @OneToMany(() => BorrowRecord, (borrowRecord) => borrowRecord.user, {
    eager: false,
    onDelete: 'SET NULL',
  })
  borrowingHistory?: Promise<BorrowRecord[]>;

  @OneToMany(() => ReservationRequest, (reservationRequest) => reservationRequest.user, {
    eager: false,
    onDelete: 'SET NULL',
  })
  reservationHistory?: Promise<ReservationRequest[]>;
}
