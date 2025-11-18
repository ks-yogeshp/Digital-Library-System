import { join } from 'path';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

import { CONFIG } from 'src/config';
import { CUSTOM_REPOSITORY_KEY } from './decorators/repository.decorator';
import { AuthorRepository } from './repositories/author.repository';
import { BookRepository } from './repositories/book.repository';
import { BorrowRecordRepository } from './repositories/borrow-record.repository';
import { ReservationRequestRepository } from './repositories/reservation-request.repository';
import { UserRepository } from './repositories/user.repository';

export const datasourceConfig = (): DataSourceOptions => ({
  type: 'postgres',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}'), join(__dirname, '../**/*.view-entity{.ts,.js}')],
  migrations: [join(__dirname, '/migrations/*{.ts,.js}')],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  seeds: [join(__dirname, 'src/database/seeding/seeds/*{.ts,.js}')],
  factories: [join(__dirname, 'src/database/seeding/factories/*{.ts,.js}')],
  host: CONFIG.DATABASE_HOST,
  port: CONFIG.DATABASE_PORT,
  username: CONFIG.DATABASE_USERNAME,
  password: CONFIG.DATABASE_PASSWORD,
  database: CONFIG.DATABASE_NAME,
  dropSchema: false,
  synchronize: CONFIG.DATABASE_SYNC,
  migrationsTableName: 'kb_migrations',
  useUTC: true,
});

@Module({
  imports: [TypeOrmModule.forRoot(datasourceConfig())],
  exports: [TypeOrmModule],
})
export class DatabaseModule {
  public static forRoot(): DynamicModule {
    const repositories = DatabaseModule.getRepositoryProviders([
      AuthorRepository,
      BookRepository,
      UserRepository,
      BorrowRecordRepository,
      ReservationRequestRepository,
    ]);

    return {
      module: DatabaseModule,
      providers: repositories,
      exports: repositories,
    };
  }

  public static forRepository<T extends new (...args: any[]) => any>(repositories: T[]): DynamicModule {
    const providers: Provider[] = DatabaseModule.getRepositoryProviders(repositories);

    return {
      exports: providers,
      module: DatabaseModule,
      providers,
    };
  }

  public static getRepositoryProviders<T extends new (...args: any[]) => any>(
    repositories: T[]
  ): Provider<(typeof repositories)[0]>[] {
    const providers: Provider[] = [];

    for (const repository of repositories) {
      const entity = Reflect.getMetadata(CUSTOM_REPOSITORY_KEY, repository);

      if (!entity) {
        continue;
      }

      providers.push({
        inject: [getDataSourceToken()],
        provide: repository,
        useFactory: (dataSource: DataSource): typeof repository => {
          const baseRepository = dataSource.getRepository<any>(entity);
          return new repository(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
        },
      });
    }

    return providers;
  }
}
