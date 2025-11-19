import { Body, Controller, Param, ParseIntPipe, Query } from '@nestjs/common';

import { PageDto } from 'src/common/dtos/page.dto';
import { QueryDto } from 'src/common/dtos/query.dto';
import { DeleteRoute, GetRoute, PostRoute, PutRoute } from './../common/decorators/route.decorators';
import { BookDto, CreateBookDto, DetailedBookDto, UpdateBookDto } from './dto/book.dto';
import { DetailedBorrowRecordDto } from './dto/borrow-record.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { CreateReservationRequestDto } from './dto/create-reservation-request.dto';
import { ExtendDto } from './dto/extend.dto';
import { DetailedReservationRequestDto } from './dto/reservation-request.dto';
import { ReturnDto } from './dto/return.dto';
import { SuccessDto } from './dto/success.dto';
import { BooksService } from './services/books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly bookService: BooksService) {}

  @GetRoute('', {
    summary: 'Get all books',
    description: 'Retrieve a list of all books with optional pagination and filtering.',
    Ok: {
      description: 'A list of books has been successfully retrieved.',
      type: BookDto,
      dtoType: 'PageDto',
      isArray: true,
    },
  })
  public async getAllBooks(@Query() queryDto: QueryDto) {
    const books = await this.bookService.getAllBooks(queryDto);
    const result = books.result.map((book) => new BookDto(book));

    return new PageDto(result, queryDto.page, queryDto.limit, books.totalItems, books.newUrl);
  }

  @GetRoute('{:id}', {
    summary: 'Get book by ID',
    description: 'Retrieve detailed information about a specific book by its ID.',
    Ok: DetailedBookDto,
  })
  public async getBookById(@Param('id', ParseIntPipe) id: number) {
    const book = await this.bookService.getBookById(id);
    return DetailedBookDto.toDto(book);
  }

  @PostRoute('', {
    summary: 'Create a new book',
    description: 'Add a new book to the library collection.',
    Created: DetailedBookDto,
  })
  public async createBook(@Body() createBookDto: CreateBookDto) {
    const book = await this.bookService.createBook(createBookDto);
    return DetailedBookDto.toDto(book);
  }

  @PutRoute('{:id}', {
    summary: 'Update book details',
    description: 'Update the information of an existing book by its ID.',
    Ok: DetailedBookDto,
  })
  public async updateBook(@Param('id', ParseIntPipe) id: number, @Body() updateBookDto: UpdateBookDto) {
    const book = await this.bookService.updateBook(id, updateBookDto);
    return DetailedBookDto.toDto(book);
  }

  @DeleteRoute('{:id}', {
    summary: 'Delete a book',
    description: 'Remove a book from the library collection by its ID.',
    Ok: SuccessDto,
  })
  public deleteBook(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.deleteBook(id);
  }

  @PostRoute('{:id}/checkout', {
    summary: 'Checkout a book',
    description: 'Checkout a book from the library by its ID.',
    Ok: DetailedBorrowRecordDto,
  })
  public async bookCheckout(@Param('id', ParseIntPipe) id: number, @Body() checkoutBook: CheckoutDto) {
    const record = await this.bookService.bookCheckout(id, checkoutBook);
    return DetailedBorrowRecordDto.toDto(record);
  }

  @PostRoute('{:id}/return', {
    summary: 'Return a book',
    description: 'Return a borrowed book to the library by its ID.',
    Ok: DetailedBorrowRecordDto,
  })
  public async bookReturn(@Param('id', ParseIntPipe) id: number, @Body() returnDto: ReturnDto) {
    const record = await this.bookService.bookReturn(id, returnDto);
    return DetailedBorrowRecordDto.toDto(record);
  }

  @PostRoute('{:id}/extend', {
    summary: 'Extend book borrow period',
    description: 'Extend the borrowing period of a borrowed book by its ID.',
    Ok: DetailedBorrowRecordDto,
  })
  public async extendBook(@Param('id', ParseIntPipe) id: number, @Body() extendDto: ExtendDto) {
    const record = await this.bookService.extendBook(id, extendDto);
    return DetailedBorrowRecordDto.toDto(record);
  }

  @PostRoute('{:id}/reserve', {
    summary: 'Create a reservation request for a book',
    description: 'Create a reservation request for a specific book by its ID.',
    Ok: DetailedReservationRequestDto,
  })
  public async createReservationResquest(
    @Param('id', ParseIntPipe) id: number,
    @Body() createReservationRequestDto: CreateReservationRequestDto
  ) {
    const reservation = await this.bookService.createReservation(id, createReservationRequestDto);
    return DetailedReservationRequestDto.toDto(reservation);
  }
}
