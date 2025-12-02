import { Body, Controller, Param, ParseIntPipe, Query } from '@nestjs/common';

import type { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { PageDto } from 'src/common/dtos/page.dto';
import { QueryDto } from 'src/common/dtos/query.dto';
import { Role } from 'src/database/entities/enums/role.enum';
import { DeleteRoute, GetRoute, PostRoute, PutRoute } from './../common/decorators/route.decorators';
import { BookDto, CreateBookDto, DetailedBookDto, UpdateBookDto } from './dto/book.dto';
import { DetailedBorrowRecordDto } from './dto/borrow-record.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { ExtendDto } from './dto/extend.dto';
import { DetailedReservationRequestDto } from './dto/reservation-request.dto';
import { SuccessDto } from './dto/success.dto';
import { BooksService } from './services/books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly bookService: BooksService) {}

  @Auth()
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
  public async getAllBooks(@Query() queryDto: QueryDto, @ActiveUser() user: IActiveUser) {
    const books = await this.bookService.getAllBooks(queryDto);
    const result = books.result.map((book) => new BookDto(book, user.role));

    return new PageDto(result, queryDto.page, queryDto.limit, books.totalItems, books.newUrl);
  }

  @Auth()
  @GetRoute('{:id}', {
    summary: 'Get book by ID',
    description: 'Retrieve detailed information about a specific book by its ID.',
    Ok: DetailedBookDto,
  })
  public async getBookById(@Param('id', ParseIntPipe) id: number, @ActiveUser() user: IActiveUser) {
    const book = await this.bookService.getBookById(id);
    return DetailedBookDto.toDto(book, user.role);
  }

  @Auth({
    roles: [Role.ADMIN, Role.MANAGER],
  })
  @PostRoute('', {
    summary: 'Create a new book',
    description: 'Add a new book to the library collection.',
    Created: DetailedBookDto,
  })
  public async createBook(@ActiveUser() user: IActiveUser, @Body() createBookDto: CreateBookDto) {
    const book = await this.bookService.createBook(user, createBookDto);
    return DetailedBookDto.toDto(book, user.role);
  }

  @Auth({
    roles: [Role.ADMIN, Role.MANAGER],
  })
  @PutRoute('{:id}', {
    summary: 'Update book details',
    description: 'Update the information of an existing book by its ID.',
    Ok: DetailedBookDto,
  })
  public async updateBook(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: IActiveUser,
    @Body() updateBookDto: UpdateBookDto
  ) {
    const book = await this.bookService.updateBook(id, user, updateBookDto);
    return DetailedBookDto.toDto(book, user.role);
  }

  @Auth({
    roles: [Role.ADMIN],
  })
  @DeleteRoute('{:id}', {
    summary: 'Delete a book',
    description: 'Remove a book from the library collection by its ID.',
    Ok: SuccessDto,
  })
  public deleteBook(@Param('id', ParseIntPipe) id: number, @ActiveUser() user: IActiveUser) {
    return this.bookService.deleteBook(id, user);
  }

  @Auth({
    roles: [Role.STUDENT],
  })
  @PostRoute('{:id}/checkout', {
    summary: 'Checkout a book',
    description: 'Checkout a book from the library by its ID.',
    Ok: DetailedBorrowRecordDto,
  })
  public async bookCheckout(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: IActiveUser,
    @Body() checkoutBook: CheckoutDto
  ) {
    const record = await this.bookService.bookCheckout(id, user, checkoutBook);
    return DetailedBorrowRecordDto.toDto(record);
  }

  @Auth({
    roles: [Role.STUDENT],
  })
  @PostRoute('{:id}/return', {
    summary: 'Return a book',
    description: 'Return a borrowed book to the library by its ID.',
    Ok: DetailedBorrowRecordDto,
  })
  public async bookReturn(@Param('id', ParseIntPipe) id: number, @ActiveUser() user: IActiveUser) {
    const record = await this.bookService.bookReturn(id, user);
    return DetailedBorrowRecordDto.toDto(record);
  }

  @Auth({
    roles: [Role.STUDENT],
  })
  @PostRoute('{:id}/extend', {
    summary: 'Extend book borrow period',
    description: 'Extend the borrowing period of a borrowed book by its ID.',
    Ok: DetailedBorrowRecordDto,
  })
  public async extendBook(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: IActiveUser,
    @Body() extendDto: ExtendDto
  ) {
    const record = await this.bookService.extendBook(id, user, extendDto);
    return DetailedBorrowRecordDto.toDto(record);
  }

  @Auth({
    roles: [Role.STUDENT],
  })
  @PostRoute('{:id}/reserve', {
    summary: 'Create a reservation request for a book',
    description: 'Create a reservation request for a specific book by its ID.',
    Ok: DetailedReservationRequestDto,
  })
  public async createReservationResquest(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: IActiveUser
  ) {
    const reservation = await this.bookService.createReservation(id, user);
    return DetailedReservationRequestDto.toDto(reservation);
  }
}
