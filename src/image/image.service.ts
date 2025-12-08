import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { AuthorRepository } from 'src/database/repositories/author.repository';
import { BookRepository } from 'src/database/repositories/book.repository';
import { ImageMetadataRepository } from 'src/database/repositories/image-metadata.repository';
import { ImageMetadata } from 'src/database/schemas/image-metadata.schema';

@Injectable()
export class ImageService {
  constructor(
    private readonly imageMetadataRepository: ImageMetadataRepository,
    private readonly authorRepository: AuthorRepository,
    private readonly bookRepository: BookRepository
  ) {}
  public async uploadImage(file: Express.Multer.File, type: 'author' | 'book', id: string) {
    if (!file) {
      throw new Error('No file provided');
    }
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
    }
    let imageMetadata: ImageMetadata = new ImageMetadata();
    if (type === 'author') {
      const author = await this.authorRepository.query().findById(new Types.ObjectId(id));
      if (!author) {
        throw new NotFoundException('Author not found');
      }
      const existing = await this.imageMetadataRepository.query().findOne({ author: author._id });
      if (existing) {
        imageMetadata = existing;
      } else {
        imageMetadata.author = author._id;
      }
    } else if (type === 'book') {
      const book = await this.bookRepository.query().findById(new Types.ObjectId(id));
      if (!book) {
        throw new NotFoundException('Book not found');
      }
      const existing = await this.imageMetadataRepository.query().findOne({ book: book._id });
      if (existing) {
        imageMetadata = existing;
      } else {
        imageMetadata.book = book._id;
      }
    } else {
      throw new Error('Invalid type. Must be either "author" or "book".');
    }
    imageMetadata.imageName = file.filename;
    imageMetadata.imagePath = `uploads/${type}s/${file.filename}`;
    return await this.imageMetadataRepository.query().insertOne(imageMetadata);
  }

  public async getUploadedImage(type: 'author' | 'book', id: string) {
    let imageMetadata: ImageMetadata | null = null;
    if (type === 'author') {
      imageMetadata = await this.imageMetadataRepository.query().findOne({ author: new Types.ObjectId(id) });
    } else if (type === 'book') {
      imageMetadata = await this.imageMetadataRepository.query().findOne({ book: new Types.ObjectId(id) });
    }
    if (!imageMetadata) {
      throw new NotFoundException('Image not found');
    }
    return imageMetadata;
  }
}
