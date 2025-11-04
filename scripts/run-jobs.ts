import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { SchedularService } from 'src/schedular/providers/schedular.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const tasksService = app.get(SchedularService);
  await tasksService.runNow(); // runs overdue + reminders
  await app.close();
}
bootstrap();
