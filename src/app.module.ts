import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorsModule } from './authors/authors.module';
import { BooksModule } from './books/books.module';
import { UsersModule } from './users/users.module';
import { BorrowRecordModule } from './borrow-record/borrow-record.module';
import { ReservationRequestModule } from './reservation-request/reservation-request.module';
import { QueryModule } from './common/query/query.module';
import { MailService } from './mail/providers/mail.service';
import { MailModule } from './mail/mail.module';
import { SchedularModule } from './schedular/schedular.module';
import enviromentValidation from './config/enviroment.validation';
import { ScheduleModule } from '@nestjs/schedule';
import mailConfig from './config/mail.config';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}.local`,
      load: [databaseConfig,mailConfig],
      validationSchema: enviromentValidation,
    }),
    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        host: configService.get('database.host'),
        database: configService.get('database.name'),
        autoLoadEntities: configService.get('database.autoLoadEntities'),
        synchronize: configService.get('database.synchronize'),
      })
    }),
    ScheduleModule.forRoot(),
    AuthorsModule,
    BooksModule,
    UsersModule,
    BorrowRecordModule,
    ReservationRequestModule,
    QueryModule,
    MailModule,
    SchedularModule
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}
