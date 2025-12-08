import { DynamicModule, Module, Provider } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';

import { CONFIG } from 'src/config';
import { MongoRepositoryMetadata } from './decorators/repository.decorator';
import { AuthorMongoRepository } from './repositories/author-mongo.repository';
import { BookMongoRepository } from './repositories/book-mongo.repository';
import { BorrowRecordMongoRepository } from './repositories/borrow-record-mongo.repository';
import { ReservationRequestMongoRepository } from './repositories/reservation-request-mongo.repository';
import { UserMongoRepository } from './repositories/user-mongo.repository';
import { Model } from 'mongoose';
import { ImageMetadataMongoRepository } from './repositories/image-metadata-mongo.repository';

@Module({
  imports: [MongooseModule.forRoot(CONFIG.DATABASE_MONGO_URL)],
  exports: [MongooseModule],
})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const repositories = [
      AuthorMongoRepository,
      BookMongoRepository,
      UserMongoRepository,
      BorrowRecordMongoRepository,
      ReservationRequestMongoRepository,
      ImageMetadataMongoRepository
    ];
    const schemas = repositories.map((repo) => {
      const metadata = Reflect.getMetadata('MONGO_REPO', repo);
      if (!metadata) throw new Error(`No @MongoRepository() metadata for ${repo.name}`);
      return { name: metadata.schemaName, schema: metadata.schema };
    });

    const mongooseFeature = MongooseModule.forFeature(schemas);

    const providers: Provider[] = repositories.map((repo) => {
      const metadata: MongoRepositoryMetadata = Reflect.getMetadata('MONGO_REPO', repo);
      type ModelType = InstanceType<typeof metadata.schema>;
      return {
        provide: repo,
        inject: [getModelToken(metadata.schemaName)],
        useFactory: (model: Model<ModelType>) => new repo(model as ModelType),
      };
    });

    return {
      module: DatabaseModule,
      imports: [mongooseFeature],
      providers,
      exports: providers,
    };
  }
}
