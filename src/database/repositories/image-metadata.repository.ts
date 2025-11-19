import { Repository } from 'typeorm';

import { DatabaseRepository } from '../decorators/repository.decorator';
import { ImageMetadata } from '../entities/image-metadata.entity';

@DatabaseRepository(ImageMetadata)
export class ImageMetadataRepository extends Repository<ImageMetadata> {}
