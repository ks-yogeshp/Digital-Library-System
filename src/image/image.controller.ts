import { createReadStream } from 'fs';
import { join } from 'path';
import type { Response } from 'express';
import {
  Controller,
  FileTypeValidator,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { GetRoute, PostRoute } from 'src/common/decorators/route.decorators';
import { ImageParamsDto, ImageResponseDto } from './dto/image.dto';
import { imageConfig } from './image.config';
import { ImageService } from './image.service';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @PostRoute('{:type}/{:id}', {
    summary: 'Upload Image',
    description: 'Uploads an image for the specified author or book.',
    Ok: ImageResponseDto,
  })
  @UseInterceptors(FileInterceptor('image', imageConfig))
  public async uploadImage(
    @Param() params: ImageParamsDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
        fileIsRequired: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      })
    )
    file: Express.Multer.File
  ) {
    const image = await this.imageService.uploadImage(file, params.type, params.id);
    return new ImageResponseDto(image);
  }

  @GetRoute('{:type}/{:id}', {
    summary: 'Get Uploaded Image',
    description: 'Retrieves the uploaded image for the specified author or book.',
    Ok: {
      type: StreamableFile,
      description: 'Returns the image file as a StreamableFile',
    },
  })
  public async getUserProfilePhoto(
    @Param() params: ImageParamsDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const result = await this.imageService.getUploadedImage(params.type, params.id);
    res.set({ 'Content-Type': 'image/jpeg' });
    const imageLocation = join(process.cwd(), `${result.imagePath}`);
    const file = createReadStream(imageLocation);
    return new StreamableFile(file);
  }
}
