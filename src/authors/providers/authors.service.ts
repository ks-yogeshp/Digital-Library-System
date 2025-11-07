import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, RequestTimeoutException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from '../author.entity';
import { Repository } from 'typeorm';
import { CreateAuthorDto } from '../dtos/create-author.dto';
import { PatchAuthorDto } from '../dtos/patch-author.dto';
import { QueryProvider } from 'src/common/query/providers/query.provider';
import { QueryDto } from 'src/common/query/dtos/query.dto';
import { MyEntityMap } from 'src/app.types';
import { tr } from '@faker-js/faker';

@Injectable()
export class AuthorsService {
    private readonly logger = new Logger(AuthorsService.name);
    constructor(

        @InjectRepository(Author)
        private readonly authorRepository: Repository<Author>,

        private readonly queryProvider: QueryProvider,

    ){}

    public async getAllAuthors(queryDto: QueryDto){
        try {
            return await this.queryProvider.query<Author, MyEntityMap>({
                query:queryDto,
                repository:this.authorRepository,
                searchFieldMap:{
                    Author:['name','email']
                },
                partial:{
                    search:false
                },
                relations:{
                    books:true
                }
            });
        } catch (error) {
            this.logger.error('Error fetching authors', error.stack);
            throw new InternalServerErrorException({
                message: 'Error connecting to database',
                details: error.message,
            });
        }
    }

    public async getAuthorById(id: number){
        try {
            return await this.authorRepository.findOne({
                where:{
                    id:id
                },
                relations:{
                    books:true
                }
            });
        } catch (error) {
            this.logger.error('Error fetching authors', error.stack);
            throw new InternalServerErrorException({
                message: 'Error connecting to database',
                details: error.message,
            });
        }
    }

    public async createAuthor(createAuthorDto: CreateAuthorDto){

        try {
            const existingAuthor = await this.authorRepository.findOneBy({
                email: createAuthorDto.email,
            });
    
            if (existingAuthor) {
                throw new BadRequestException('Author already exists with this email');
            }
    
            const newAuthor = this.authorRepository.create(createAuthorDto);
            return await this.authorRepository.save(newAuthor);
    
        } catch (error) {
            this.logger.error('Error creating author', error.stack);
            throw new InternalServerErrorException({
                message: 'Error creating the author',
                details: error.message,
            });
        }

    }

    public async updateAuthor(patchAuthorDto: PatchAuthorDto){

        let existingAuthor: Author | null; 
        try {
            existingAuthor = await this.authorRepository.findOneBy({ id: patchAuthorDto.id });
    
            if (!existingAuthor) {
                throw new NotFoundException('Author does not exist with this Id');
            }
    
            existingAuthor.name = patchAuthorDto.name ?? existingAuthor.name;
            existingAuthor.country = patchAuthorDto.country ?? existingAuthor.country;
    
            return await this.authorRepository.save(existingAuthor);
    
        } catch (error) {
            this.logger.error('Error updating author', error.stack);
            throw new InternalServerErrorException({
                message: 'Error updating the author',
                details: error.message,
            });
        }
        
    }

    public async deleteAuthor(id:number){
        try {
            const result = await this.authorRepository.delete(id);
    
            if (result.affected === 0) {
                throw new NotFoundException('Author does not exist with this Id');
            }
    
            return { message: 'Author deleted successfully' };
    
        } catch (error) {
            this.logger.error('Error deleting author', error);
            throw new InternalServerErrorException({
                message: 'An error occurred while deleting the author',
                details: error.message,
            });
        }
    }

}
