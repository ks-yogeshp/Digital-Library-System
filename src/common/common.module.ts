import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Global, Module } from '@nestjs/common';

import { CONFIG, logConfig } from 'src/config';
import { LibraryModule } from 'src/library/library.module';
import { LogModule } from './log';
import { MailService } from './mail/mail.service';
import { QueryFilterService } from './query/query-filter.service';
import { QuerySearchService } from './query/query-search.service';
import { QueryService } from './query/query.service';
import { SchedularService } from './schedular/schedular.service';

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
  ],
  providers: [QueryService, QuerySearchService, QueryFilterService, MailService, SchedularService],
  exports: [QueryService, MailService],
})
export class CommonModule {}
