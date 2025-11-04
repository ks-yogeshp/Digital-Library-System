import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { AuthorsService } from './providers/authors.service';
import { CreateAuthorDto } from './dtos/create-author.dto';
import { PatchAuthorDto } from './dtos/patch-author.dto';
import { QueryDto } from 'src/common/query/dtos/query.dto';

@Controller('authors')
export class AuthorsController {

    constructor(

        private readonly authorsService: AuthorsService,

    ){}

    @Get()
    public getAllAuthors(
        @Query() queryDto: QueryDto,
    ){
        return this.authorsService.getAllAuthors(queryDto);
    }

    @Get('{:id}')
    public getAuthorById(
        @Param('id',ParseIntPipe) id:number
    ){
        return this.authorsService.getAuthorById(id);
    }


    @Post()
    public createAuthor(
        @Body() createAuthorDto: CreateAuthorDto,
    ){
        return this.authorsService.createAuthor(createAuthorDto);
    }

    @Patch()
    public updateAuthor(
        @Body() patchAuthorDto: PatchAuthorDto,
    ){
        return this.authorsService.updateAuthor(patchAuthorDto);
    }

    @Delete('{:id}')
    public deleteAuthor(
        @Param('id',ParseIntPipe) id: number
    ){
        return this.authorsService.deleteAuthor(id);
    }

}
