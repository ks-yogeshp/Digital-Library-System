import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { GlobalExceptionsFilter } from './common/interceptors/global-exceptions.filter';
import { LOG } from './common/log';
import { CONFIG } from './config';

export function appCreate(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );
  const logger = app.get(LOG);
  Logger.overrideLogger(logger);
  app.useLogger(logger);
  app.flushLogs();
  app.enableShutdownHooks();

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new GlobalExceptionsFilter(httpAdapter, {
      appEnv: CONFIG.APP_ENV as unknown as any,
    })
  );
  const config = new DocumentBuilder().setVersion('1.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();
}
