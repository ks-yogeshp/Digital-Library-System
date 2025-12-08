import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { MongoRepository } from '../decorators/repository.decorator';
import { Author, AuthorSchema } from '../schemas/author.schema';

@MongoRepository(Author.name, AuthorSchema)
export class AuthorRepository {
  constructor(
    @InjectModel(Author.name)
    private readonly authorModel: Model<Author>
  ) {
    // super();
  }

  query() {
    return this.authorModel;
  }

  async softDeleteById(id: string, sub: Types.ObjectId) {
    return await this.authorModel.updateOne({ _id: id }, { deletedAt: new Date(), deletedBy: sub }).exec();
  }
}
