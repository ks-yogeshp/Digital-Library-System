import { Repository } from 'typeorm';

import { DatabaseRepository } from '../decorators/repository.decorator';
import { Author } from '../entities/author.entity';

@DatabaseRepository(Author)
export class AuthorRepository extends Repository<Author> {}
