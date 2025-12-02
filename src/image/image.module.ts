import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/database/database.module';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';

@Module({
  imports: [DatabaseModule.forRoot()],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
