import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Author } from './author.entity';
import { Book } from './book.entity';

@Entity()
export class ImageMetadata {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  authorId?: number;

  @OneToOne(() => Author, { nullable: true })
  @JoinColumn()
  author?: Promise<Author>;

  @Column()
  bookId?: number;

  @OneToOne(() => Book, { nullable: true })
  @JoinColumn()
  book?: Promise<Book>;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  imageName: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  imagePath: string;
}
