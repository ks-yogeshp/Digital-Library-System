import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { MailService } from './common/mail/mail.service';
import { ImageModule } from './image/image.module';
import { LibraryService } from './library/services/library.service';

@Module({
  imports: [ScheduleModule.forRoot(), CommonModule, ImageModule],
  controllers: [AppController],
  providers: [AppService, MailService, LibraryService],
})
export class AppModule {}
