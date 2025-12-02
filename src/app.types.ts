import { Author } from './database/entities/author.entity';
import { Book } from './database/entities/book.entity';

export type MyEntityMap = {
  Book: Book;
  Author: Author;
};
