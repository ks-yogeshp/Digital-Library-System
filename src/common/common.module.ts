import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';

import { CONFIG, logConfig } from 'src/config';
import { LibraryModule } from 'src/library/library.module';
import { JobsService } from './jobs/jobs.service';
import { ExpiredReservationWorker } from './jobs/workers/expired-reservation.worker';
import { MailQueueWorker } from './jobs/workers/mail-queue.worker';
import { MonthlyReportWorker } from './jobs/workers/monthly-report.worker';
import { OverdueWorker } from './jobs/workers/overdue.worker';
import { LogModule } from './log';
import { MailService } from './mail/mail.service';
import { QueryFilterService } from './query/query-filter.service';
import { QuerySearchService } from './query/query-search.service';
import { QueryService } from './query/query.service';
import { SendRemainderWorker } from './jobs/workers/send-remainder.worker';

const templateDir =
  process.env.NODE_ENV === 'production'
    ? join(__dirname, 'templates') // dist folder
    : join(process.cwd(), 'src/common/mail/templates'); // dev

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: CONFIG.MAIL_HOST,
          secure: false,
          port: 2525,
          auth: {
            user: CONFIG.SMTP_USERNAME,
            pass: CONFIG.SMTP_PASSWORD,
          },
        },
        defaults: {
          from: CONFIG.MAIL_FROM,
        },
        template: {
          dir: templateDir,
          adapter: new EjsAdapter({
            inlineCssEnabled: true,
          }),
          options: {
            strict: false,
          },
        },
      }),
    }),
    LibraryModule,
    LogModule.forRoot(logConfig),
    BullModule.forRoot({
      connection: {
        url: CONFIG.REDIS_URL,
      },
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
    BullModule.registerQueue(
      {
        name: 'overdue-check',
      },
      {
        name: 'send-reminders',
      },
      {
        name: 'expired-reservations',
      },
      {
        name: 'monthly-reports',
      },
      {
        name: 'mail-queue',
      }
    ),
  ],
  providers: [
    QueryService,
    QuerySearchService,
    QueryFilterService,
    MailService,
    JobsService,
    OverdueWorker,
    SendRemainderWorker,
    ExpiredReservationWorker,
    MonthlyReportWorker,
    MailQueueWorker,
  ],
  exports: [QueryService, MailService, BullModule],
})
export class CommonModule {}
