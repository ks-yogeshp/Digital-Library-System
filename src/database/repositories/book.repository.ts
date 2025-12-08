import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { MongoRepository } from '../decorators/repository.decorator';
import { Book, BookSchema } from '../schemas/book.schema';

@MongoRepository(Book.name, BookSchema)
export class BookRepository {
  constructor(
    @InjectModel(Book.name)
    private readonly bookModel: Model<Book>
  ) {}

  query() {
    return this.bookModel;
  }

  async softDeleteById(id: string, sub: Types.ObjectId) {
    return await this.bookModel.updateOne({ _id: id }, { deletedAt: new Date(), deletedBy: sub }).exec();
  }
}
