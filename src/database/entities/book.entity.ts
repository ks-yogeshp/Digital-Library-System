import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Author } from 'src/database/entities/author.entity';
import { BorrowRecord } from 'src/database/entities/borrow-record.entity';
import { AvailabilityStatus } from './enums/availibity-status.enum';
import { Category } from './enums/category.enum';
import { ReservationRequest } from './reservation-request.entity';

export type IBookWihtBorrowCount = Book & { authorNames: string[]; borrowCount: number };

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    unique: true,
  })
  ISBN: string;

  @Column({
    type: 'enum',
    enum: Category,
    array: true,
    nullable: false,
    default: [Category.OTHER],
  })
  category: Category[];

  @ManyToMany(() => Author, (author) => author.books, { eager: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinTable()
  authors?: Promise<Author[]>;

  @Column({
    type: 'integer',
    // length: 4,
    nullable: false,
  })
  yearOfPublication: number;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  version: string;

  @Column({
    type: 'enum',
    enum: AvailabilityStatus,
    default: AvailabilityStatus.AVAILABLE,
  })
  availabilityStatus: AvailabilityStatus;

  @OneToMany(() => BorrowRecord, (borrowRecord) => borrowRecord.book, {
    eager: false,
    onDelete: 'SET NULL',
  })
  borrowingHistory?: Promise<BorrowRecord[]>;

  @OneToMany(() => ReservationRequest, (reservationRequest) => reservationRequest.book, {
    eager: false,
    onDelete: 'SET NULL',
  })
  reservationHistory?: Promise<ReservationRequest[]>;
}
