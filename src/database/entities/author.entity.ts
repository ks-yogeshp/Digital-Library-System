import { Column, Entity, ManyToMany } from 'typeorm';

import { Book } from 'src/database/entities/book.entity';
import { MetadataSoft } from './metadata-soft.entity';

@Entity()
export class Author extends MetadataSoft {
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

  @ManyToMany(() => Book, (book) => book.authors, { eager: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  books?: Promise<Book[]>;
}
