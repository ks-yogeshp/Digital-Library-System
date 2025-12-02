import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, In } from 'typeorm';

import { MyEntityMap } from 'src/app.types';
import { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { QueryDto } from 'src/common/dtos/query.dto';
import { QueryService } from 'src/common/query/query.service';
import { BorrowRecord } from 'src/database/entities/borrow-record.entity';
import { AuthorRepository } from 'src/database/repositories/author.repository';
import { BookRepository } from 'src/database/repositories/book.repository';
import { Book } from '../../database/entities/book.entity';
import { CreateBookDto, UpdateBookDto } from '../dto/book.dto';
import { CheckoutDto } from '../dto/checkout.dto';
import { ExtendDto } from '../dto/extend.dto';
import { BookCheckoutService } from './book-checkout.service';
import { BookExtendService } from './book-extend.service';
import { BookReserveService } from './book-reserve.service';
import { BookReturnService } from './book-return.service';

@Injectable()
export class BooksService {
  constructor(
    private readonly bookRepository: BookRepository,

    private readonly authorRepository: AuthorRepository,

    private readonly queryProvider: QueryService,

    private readonly bookCheckoutService: BookCheckoutService,

    private readonly bookReturnService: BookReturnService,

    private readonly bookExtendService: BookExtendService,

    private readonly bookReserveService: BookReserveService,

    private readonly dataSource: DataSource
  ) {}

  public async getAllBooks(queryDto: QueryDto) {
    try {
      return await this.queryProvider.query<Book, MyEntityMap>({
        query: queryDto,
        repository: this.bookRepository,
        searchFieldMap: {
          Book: ['ISBN', 'name', 'authors'],
          Author: ['name'],
        },
        partial: {
          search: true,
        },
        relations: {
          authors: true,
        },
      });
    } catch (error) {
      Logger.error({ msg: 'Error fetching books', error: error.message, stack: error.stack });
      throw error;
    }
  }

  public async getBookById(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        authors: true,
        borrowingHistory: true,
        reservationHistory: true,
      },
    });

    if (!book) throw new NotFoundException('Book not Found');

    return book;
  }

  public async createBook(user: IActiveUser, createBookDto: CreateBookDto) {
    const existingBook = await this.bookRepository.findOneBy({
      ISBN: createBookDto.ISBN,
    });

    if (existingBook) throw new BadRequestException('Book already exists with this ISBN number');
    if (!Array.isArray(createBookDto.authorIds) || createBookDto.authorIds.length === 0) {
      throw new BadRequestException('authorsIds must be a non-empty array');
    }
    const authors = await this.authorRepository.find({
      where: {
        id: In(createBookDto.authorIds),
      },
    });

    if (authors.length !== createBookDto.authorIds.length)
      throw new NotFoundException('One or more authors were not found.');
    const newBook = new Book();
    newBook.name = createBookDto.name;
    newBook.ISBN = createBookDto.ISBN;
    newBook.category = createBookDto.category;
    newBook.version = createBookDto.version;
    newBook.yearOfPublication = createBookDto.yearOfPublication;
    newBook.createdBy = user.sub;
    // newBook.authors = Promise.resolve([...authors]);
    await this.dataSource.transaction(async (manager) => {
      const savedBook = await manager.getRepository(Book).save(newBook);
      await manager
        .getRepository(Book)
        .createQueryBuilder()
        .relation(Book, 'authors')
        .of(savedBook)
        .add(authors);
    });
    const book = await this.bookRepository.findOne({
      where: { id: newBook.id },
      relations: { authors: true, borrowingHistory: true, reservationHistory: true },
    });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  public async updateBook(id: number, user: IActiveUser, updateBookDto: UpdateBookDto) {
    const existingBook = await this.bookRepository.findOneBy({
      id: id,
    });

    if (!existingBook) throw new NotFoundException('Book does not exist with this Id');

    const authors = await this.authorRepository.find({
      where: {
        id: In(updateBookDto.authorsIds),
      },
    });

    if (authors.length !== updateBookDto.authorsIds.length)
      throw new NotFoundException('One or more authors were not found.');

    existingBook.name = updateBookDto.name ?? existingBook.name;
    existingBook.yearOfPublication = updateBookDto.yearOfPublication ?? existingBook.yearOfPublication;
    existingBook.category = updateBookDto.category ?? existingBook.category;
    existingBook.version = updateBookDto.version ?? existingBook.version;
    existingBook.updatedBy = user.sub;
    // existingBook.authors = updateBookDto.authorsIds ? Promise.resolve(authors) : existingBook.authors;
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Book).save(existingBook);
      if (updateBookDto.authorsIds) {
        await manager
          .getRepository(Book)
          .createQueryBuilder()
          .relation(Book, 'authors')
          .of(existingBook)
          .remove(await existingBook.authors);
        await manager
          .getRepository(Book)
          .createQueryBuilder()
          .relation(Book, 'authors')
          .of(existingBook)
          .add(authors);
      }
    });

    const book = await this.bookRepository.findOne({
      where: { id: existingBook.id },
      relations: { authors: true },
    });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  public async deleteBook(id: number, user: IActiveUser) {
    const book = await this.bookRepository.findOneBy({ id });

    if (!book) throw new NotFoundException('Book does not exist with this Id');

    book.deletedBy = user.sub;
    await this.bookRepository.save(book);

    await this.bookRepository.softDelete(id);

    return { message: 'Book deleted successfully' };
  }

  public async bookCheckout(id: number, user: IActiveUser, checkoutDto: CheckoutDto) {
    const record = await this.bookCheckoutService.checkout(id, user, checkoutDto);
    return this.getRecord(record.id);
  }

  public async bookReturn(id: number, user: IActiveUser) {
    const record = await this.bookReturnService.bookReturn(id, user);
    return this.getRecord(record.id);
  }

  public async extendBook(id: number, user: IActiveUser, extendDto: ExtendDto) {
    const record = await this.bookExtendService.extendBook(id, user, extendDto);
    return this.getRecord(record.id);
  }

  public async createReservation(id: number, user: IActiveUser) {
    return this.bookReserveService.createReservation(id, user);
  }

  async getRecord(id: number) {
    const record = await this.dataSource.getRepository(BorrowRecord).findOne({
      where: { id },
    });
    if (!record) throw new NotFoundException('BorrowRecord not Found');
    return record;
  }
}
