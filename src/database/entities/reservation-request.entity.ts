import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Book } from 'src/database/entities/book.entity';
import { RequestStatus } from 'src/database/entities/enums/request-status.enum';
import { User } from 'src/database/entities/user.entity';
import { AbstractSoftEntity } from './abstract-soft.entity';

@Entity()
export class ReservationRequest extends AbstractSoftEntity {
  @Column()
  bookId: number;

  @ManyToOne(() => Book, (book) => book.reservationHistory, {
    eager: false,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'bookId' })
  book: Promise<Book>;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.reservationHistory, {
    eager: false,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  user: Promise<User>;

  @CreateDateColumn()
  requestDate: Date;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  requestStatus: RequestStatus;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  active_until: Date;
}
