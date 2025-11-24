import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Book } from 'src/database/entities/book.entity';
import { User } from 'src/database/entities/user.entity';
import { AbstractSoftEntity } from './abstract-soft.entity';
import { BookStatus } from './enums/book-status.enum';

@Entity()
export class BorrowRecord extends AbstractSoftEntity {
  @Column()
  bookId: number;

  @ManyToOne(() => Book, (book) => book.borrowingHistory, {
    eager: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'bookId' })
  book: Promise<Book>;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.borrowingHistory, {
    eager: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  user: Promise<User>;

  @Column({
    type: 'date',
    nullable: false,
  })
  borrowDate: Date;

  @Column({
    type: 'date',
    nullable: false,
  })
  dueDate: Date;

  @Column({
    type: 'date',
    nullable: true,
  })
  returnDate?: Date;

  @Column({
    type: 'integer',
    default: 0,
  })
  penalty?: number;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  penaltyPaid?: boolean;

  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
  })
  extensionCount: number;

  @Column({
    type: 'enum',
    enum: BookStatus,
    default: BookStatus.BORROWED,
  })
  bookStatus: BookStatus;
}
