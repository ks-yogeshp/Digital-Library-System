import { EnumField, FileField, NumberField, StringField } from 'src/common/decorators/field.decorators';
import { ImageMetadata } from 'src/database/entities/image-metadata.entity';
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
    example: 1,
  })
  id: number;
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
