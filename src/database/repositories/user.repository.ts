import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { MongoRepository } from '../decorators/repository.decorator';
import { User, UserSchema } from '../schemas/user.schema';

@MongoRepository(User.name, UserSchema)
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>
  ) {}

  query() {
    return this.userModel;
  }

  async softDeleteById(id: Types.ObjectId) {
    return await this.userModel.updateOne({ _id: id }, { deletedAt: new Date() }).exec();
  }
}
