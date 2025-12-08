import { Author } from './database/schemas/author.schema';
import { Book } from './database/schemas/book.schema';
import { User } from './database/schemas/user.schema';

export type MyEntityMap = {
  Book: Book;
  Author: Author;
  User: User;
};
