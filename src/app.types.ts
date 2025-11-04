import { Author } from './authors/author.entity';
import { Book } from './books/book.entity';

export type MyEntityMap = {
    Book: Book;
    Author: Author;
}