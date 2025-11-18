import { Repository } from 'typeorm';

import { DatabaseRepository } from '../decorators/repository.decorator';
import { User } from '../entities/user.entity';

@DatabaseRepository(User)
export class UserRepository extends Repository<User> {}
