import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Book } from '../book.entity';
import { PatchBookDto } from '../dtos/patch-book.dto';
import { CreateBookDto } from '../dtos/creat-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { QueryDto } from 'src/common/query/dtos/query.dto';
import { QueryProvider } from 'src/common/query/providers/query.provider';
import { CheckoutProvider } from './checkout.provider';
import { CheckoutDto } from '../dtos/checkout.dto';
import { ReturnProvider } from './return.provider';
import { ReturnDto } from '../dtos/return.dto';
import { MyEntityMap } from 'src/app.types';
import { ExtendProvider } from './extend.provider';
import { ExtendDto } from '../dtos/extend.dto';

@Injectable()
export class BooksService {

private readonly logger = new Logger(BooksService.name);
    constructor(

        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,

        private readonly queryProvider: QueryProvider,

        private readonly checkoutProvider: CheckoutProvider,

        private readonly returnProvider: ReturnProvider,

        private readonly extendProvider: ExtendProvider,
    ){}

    public async getAllBooks(queryDto: QueryDto){
        try {
            return await this.queryProvider.query<Book,MyEntityMap>(
                queryDto,
                this.bookRepository,
                {
                    Book:['ISBN','name','authors','category','availabilityStatus'],
                    Author:['name',]
                },
                {},
                // {
                //     yearOfPublication: MoreThan(2000)
                // },
                {
                    authors:true
                }
            )
        } catch (error) {
            this.logger.error('Error fetching authors', error.stack);
            throw new InternalServerErrorException({
                message: 'Error connecting to database',
                details: error.message,
            });
        }
    }

    public async getBookById(id: number){
        try {
            return await this.bookRepository.find({
                where:{
                    id: id
                },
                relations:{
                    authors:true,
                    borrowingHistory:{
                        user:true
                    }
                },
            });
        } catch (error) {
            this.logger.error('Error fetching authors', error.stack);
            throw new InternalServerErrorException({
                message: 'Error connecting to database',
                details: error.message,
            });
        }
    }

    public async createBook(createBookDto: CreateBookDto){

        try {
            const existingBook = await this.bookRepository.findOneBy({
                ISBN: createBookDto.ISBN,
            });
    
            if (existingBook) {
                throw new BadRequestException('Book already exists with this ISBN number');
            }
    
            const newBook = this.bookRepository.create(createBookDto);
            return await this.bookRepository.save(newBook);
    
        } catch (error) {
            this.logger.error('Error creating author', error.stack);
            throw new InternalServerErrorException({
                message: 'Error creating the author',
                details: error.message,
            });
        }

    }

    public async updateBook(patchBookDto: PatchBookDto){

        let existingBook: Book | null; 
        try {
            existingBook = await this.bookRepository.findOneBy({ id: patchBookDto.id });
    
            if (!existingBook) {
                throw new NotFoundException('Book does not exist with this Id');
            }
    
            // existingBook.name = patchBookDto.name ?? existingBook.name;
            // existingBook.country = patchBookDto.country ?? existingBook.country;
    
            return await this.bookRepository.save(existingBook);
    
        } catch (error) {
            this.logger.error('Error updating author', error.stack);
            throw new InternalServerErrorException({
                message: 'Error updating the author',
                details: error.message,
            });
        }
        
    }

    public async deleteBook(id:number){
        try {
            const result = await this.bookRepository.delete(id);
    
            if (result.affected === 0) {
                throw new NotFoundException('Book does not exist with this Id');
            }
    
            return { message: 'Book deleted successfully' };
    
        } catch (error) {
            this.logger.error('Error deleting author', error);
            throw new InternalServerErrorException({
                message: 'An error occurred while deleting the author',
                details: error.message,
            });
        }
    }

    public async bookCheckout(checkoutDto: CheckoutDto){
        return this.checkoutProvider.checkout(checkoutDto);
    }

    public async bookReturn(returnDto: ReturnDto){
        return this.returnProvider.bookReturn(returnDto);
    }

    public async extendBook(extendDto: ExtendDto){
        return this.extendProvider.extendBook(extendDto);
    }
}
