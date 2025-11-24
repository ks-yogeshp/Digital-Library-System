import { Injectable, NotFoundException } from '@nestjs/common';

import { ImageMetadata } from 'src/database/entities/image-metadata.entity';
import { AuthorRepository } from 'src/database/repositories/author.repository';
import { BookRepository } from 'src/database/repositories/book.repository';
import { ImageMetadataRepository } from 'src/database/repositories/image-metadata.repository';

@Injectable()
export class ImageService {
  constructor(
    private readonly imageMetadataRepository: ImageMetadataRepository,
    private readonly authorRepository: AuthorRepository,
    private readonly bookRepository: BookRepository
  ) {}
  public async uploadImage(file: Express.Multer.File, type: 'author' | 'book', id: number) {
    if (!file) {
      throw new Error('No file provided');
    }
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
    }
    let imageMetadata: ImageMetadata = new ImageMetadata();
    if (type === 'author') {
      const author = await this.authorRepository.findOne({ where: { id } });
      if (!author) {
        throw new NotFoundException('Author not found');
      }
      const existing = await this.imageMetadataRepository.findOne({ where: { author: { id } } });
      if (existing) {
        imageMetadata = existing;
      } else {
        imageMetadata.authorId = author.id;
      }
    } else if (type === 'book') {
      const book = await this.bookRepository.findOne({ where: { id } });
      if (!book) {
        throw new NotFoundException('Book not found');
      }
      const existing = await this.imageMetadataRepository.findOne({ where: { book: { id } } });
      if (existing) {
        imageMetadata = existing;
      } else {
        imageMetadata.bookId = book.id;
      }
    } else {
      throw new Error('Invalid type. Must be either "author" or "book".');
    }
    imageMetadata.imageName = file.filename;
    imageMetadata.imagePath = `uploads/${type}s/${file.filename}`;
    await this.imageMetadataRepository.save(imageMetadata);
    return imageMetadata;
  }

  public async getUploadedImage(type: 'author' | 'book', id: number) {
    let imageMetadata: ImageMetadata | null = null;
    if (type === 'author') {
      imageMetadata = await this.imageMetadataRepository.findOne({ where: { author: { id } } });
    } else if (type === 'book') {
      imageMetadata = await this.imageMetadataRepository.findOne({ where: { book: { id } } });
    }
    if (!imageMetadata) {
      throw new NotFoundException('Image not found');
    }
    return imageMetadata;
  }
}
