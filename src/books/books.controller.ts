import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { BooksService } from './providers/books.service';
import { CreateBookDto } from './dtos/creat-book.dto';
import { PatchBookDto } from './dtos/patch-book.dto';
import { QueryDto } from 'src/common/query/dtos/query.dto';
import { CheckoutDto } from './dtos/checkout.dto';
import { ReturnDto } from './dtos/return.dto';
import { extend } from 'joi';
import { ExtendDto } from './dtos/extend.dto';

@Controller('books')
export class BooksController {

constructor(

        private readonly bookService: BooksService,

    ){}

    @Get()
    public getAllBooks(
        @Query() queryDto: QueryDto, 
    ){
        return this.bookService.getAllBooks(queryDto);
    }

    @Get('{:id}')
    public getBookById(
        @Param('id',ParseIntPipe) id: number
    ){
        return this.bookService.getBookById(id);
    }

    @Post()
    public createBook(
        @Body() createBookDto: CreateBookDto,
    ){
        return this.bookService.createBook(createBookDto);
    }

    @Patch()
    public updateBook(
        @Body() patchBookDto: PatchBookDto,
    ){
        return this.bookService.updateBook(patchBookDto);
    }

    @Delete('{:id}')
    public deleteBook(
        @Param('id',ParseIntPipe) id: number
    ){
        return this.bookService.deleteBook(id);
    }    

    @Post('checkout')
    @UseInterceptors(ClassSerializerInterceptor)
    public bookCheckout(
        @Body() checkoutBook: CheckoutDto,
    ){
        return this.bookService.bookCheckout(checkoutBook);
    }

    @Post('return')
    @UseInterceptors(ClassSerializerInterceptor)
    public bookReturn(
        @Body() returnDto: ReturnDto,
    ){
        return this.bookService.bookReturn(returnDto);
    }

    @Post('extend')
    @UseInterceptors(ClassSerializerInterceptor)
    public extendBook(
        @Body() extendDto: ExtendDto,
    ){
        return this.bookService.extendBook(extendDto);
    }
}
