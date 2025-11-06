import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appCreate } from './app.create';
import { NestExpressApplication } from '@nestjs/platform-express';
import qs from 'qs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('query parser', (str: string) => {
    return qs.parse(str, {
    });
  });
  appCreate(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
