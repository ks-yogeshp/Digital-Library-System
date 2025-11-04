import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailService } from './providers/mail.service';

const templateDir = process.env.NODE_ENV === 'production'
  ? join(__dirname, 'templates')    // dist folder
  : join(process.cwd(), 'src/mail/templates'); // dev

@Global()
@Module({
    imports: [
        MailerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: async(config: ConfigService)=> ({
                transport:{
                    host: config.get('mail.host'),
                    secure:false,
                    port: 2525,
                    auth:{
                        user:config.get('mail.smtpUsername'),
                        pass:config.get('mail.smtpPassword')
                    }
                },
                defaults:{
                    from:`DLS <no-reply@dls.com>`
                },
                template:{
                    dir:templateDir,
                    adapter: new EjsAdapter({
                        inlineCssEnabled:true
                    }),
                    options:{
                        strict:false,
                    }
                }
            })
        })
    ],
    providers:[MailService],
    exports:[MailService]
})
export class MailModule {}
