import { Repository } from 'typeorm';

import { DatabaseRepository } from '../decorators/repository.decorator';
import { Book } from '../entities/book.entity';

@DatabaseRepository(Book)
export class BookRepository extends Repository<Book> {}
