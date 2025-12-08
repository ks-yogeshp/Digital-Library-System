import { DynamicModule, Module, Provider } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CONFIG } from 'src/config';
import { MongoRepositoryMetadata } from './decorators/repository.decorator';
import { AuthorRepository } from './repositories/author.repository';
import { BookRepository } from './repositories/book.repository';
import { BorrowRecordRepository } from './repositories/borrow-record.repository';
import { ImageMetadataRepository } from './repositories/image-metadata.repository';
import { ReservationRequestRepository } from './repositories/reservation-request.repository';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [MongooseModule.forRoot(CONFIG.DATABASE_MONGO_URL)],
  exports: [MongooseModule],
})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const repositories = [
      AuthorRepository,
      BookRepository,
      UserRepository,
      BorrowRecordRepository,
      ReservationRequestRepository,
      ImageMetadataRepository,
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
