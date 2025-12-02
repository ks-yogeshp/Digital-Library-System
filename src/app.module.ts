import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { MailService } from './common/mail/mail.service';
import { ImageModule } from './image/image.module';

@Module({
  imports: [ScheduleModule.forRoot(), CommonModule, ImageModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}
