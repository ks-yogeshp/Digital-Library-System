import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BorrowRecord } from 'src/database/entities/borrow-record.entity';
import { ReservationRequest } from './reservation-request.entity';

export type IUserWithPenalty = User & { totalPenalty: number };

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

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
    nullable: false,
  })
  @Exclude()
  password: string;

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
