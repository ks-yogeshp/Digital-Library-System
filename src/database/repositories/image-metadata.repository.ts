import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MongoRepository } from '../decorators/repository.decorator';
import { ImageMetadata, ImageMetadataSchema } from '../schemas/image-metadata.schema';

@MongoRepository(ImageMetadata.name, ImageMetadataSchema)
export class ImageMetadataRepository {
  constructor(
    @InjectModel(ImageMetadata.name)
    private readonly imageMetaDataModel: Model<ImageMetadata>
  ) {}

  query() {
    return this.imageMetaDataModel;
  }
}
