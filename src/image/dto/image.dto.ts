import { EnumField, FileField, NumberField, StringField } from 'src/common/decorators/field.decorators';
import { ImageMetadata } from 'src/database/schemas/image-metadata.schema';
import { ImageUploadType } from '../enums/image-upload-type.enum';

export class ImageUploadDto {
  @FileField()
  file: Express.Multer.File;
}

export class ImageParamsDto {
  @EnumField(() => ImageUploadType, {
    description: 'Type of the entity (author or book)',
    example: 'author',
  })
  type: ImageUploadType;

  @NumberField({
    description: 'ID of the author or book',
    example: '64b2f3c1b5d9a6a1e2d3f4b5',
  })
  id: string;
}

export class ImageResponseDto {
  @StringField({
    description: 'Upload status message',
    example: 'Image uploaded successfully',
  })
  message: string;

  @StringField({
    description: 'Name of the uploaded image file',
    example: 'example.jpg',
  })
  imageName: string;

  @StringField({
    description: 'Path to the uploaded image file',
    example: 'uploads/authors/example.jpg',
  })
  imagePath: string;

  constructor(image: ImageMetadata) {
    this.message = 'Image uploaded successfully';
    this.imageName = image.imageName;
    this.imagePath = image.imagePath;
  }
}
