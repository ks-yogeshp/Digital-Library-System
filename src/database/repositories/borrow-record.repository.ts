import { Repository } from 'typeorm';

import { DatabaseRepository } from '../decorators/repository.decorator';
import { BorrowRecord } from '../entities/borrow-record.entity';

@DatabaseRepository(BorrowRecord)
export class BorrowRecordRepository extends Repository<BorrowRecord> {}
