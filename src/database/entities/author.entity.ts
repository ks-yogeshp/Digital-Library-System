import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Book } from 'src/database/entities/book.entity';

@Entity()
export class Author {
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
  country?: string;

  @ManyToMany(() => Book, (book) => book.authors, { eager: false, onDelete: 'CASCADE' })
  books?: Promise<Book[]>;
}
