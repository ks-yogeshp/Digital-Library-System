import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MongoRepository } from '../decorators/repository.decorator';
import { BorrowRecord, BorrowRecordSchema } from '../schemas/borrow-record.schema';

@MongoRepository(BorrowRecord.name, BorrowRecordSchema)
export class BorrowRecordRepository {
  constructor(
    @InjectModel(BorrowRecord.name)
    private readonly borrowRecordModel: Model<BorrowRecord>
  ) {}

  query() {
    return this.borrowRecordModel;
  }
}
