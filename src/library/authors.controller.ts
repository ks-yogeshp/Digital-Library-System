import { Body, Controller, Param, ParseIntPipe, Query } from '@nestjs/common';

import { PageDto } from 'src/common/dtos/page.dto';
import { QueryDto } from 'src/common/dtos/query.dto';
import { DeleteRoute, GetRoute, PostRoute, PutRoute } from './../common/decorators/route.decorators';
import { AuthorDto, CreateAuthorDto, DetailedAuthorDto, UpdateAuthorDto } from './dto/author.dto';
import { SuccessDto } from './dto/success.dto';
import { AuthorsService } from './services/authors.service';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @GetRoute('', {
    summary: 'Get All Authors',
    description: 'Retrieve a list of all authors with optional pagination and filtering',
    Ok: {
      type: AuthorDto,
      dtoType: 'PageDto',
      isArray: true,
    },
  })
  public async getAllAuthors(@Query() queryDto: QueryDto) {
    const authors = await this.authorsService.getAllAuthors(queryDto);
    const result = authors.result.map((author) => new AuthorDto(author));
    return new PageDto(result, queryDto.page, queryDto.limit, authors.totalItems, authors.newUrl);
  }

  @GetRoute('{:id}', {
    summary: 'Get Author by ID',
    description: 'Retrieve a single author by their unique ID',
    Ok: DetailedAuthorDto,
  })
  public async getAuthorById(@Param('id', ParseIntPipe) id: number) {
    const author = await this.authorsService.getAuthorById(id);
    return DetailedAuthorDto.toDto(author);
  }

  @PostRoute('', {
    summary: 'Create New Author',
    description: 'Create a new author with the provided details',
    Created: DetailedAuthorDto,
  })
  public async createAuthor(@Body() createAuthorDto: CreateAuthorDto) {
    const author = await this.authorsService.createAuthor(createAuthorDto);
    return DetailedAuthorDto.toDto(author);
  }

  @PutRoute('{:id}', {
    summary: 'Update Author',
    description: 'Update the details of an existing author by their ID',
    Ok: DetailedAuthorDto,
  })
  public async updateAuthor(@Param('id', ParseIntPipe) id: number, @Body() updateAuthorDto: UpdateAuthorDto) {
    const author = await this.authorsService.updateAuthor(id, updateAuthorDto);
    return DetailedAuthorDto.toDto(author);
  }

  @DeleteRoute('{:id}', {
    summary: 'Delete Author',
    description: 'Delete an author by their unique ID',
    Ok: SuccessDto,
  })
  public async deleteAuthor(@Param('id', ParseIntPipe) id: number) {
    await this.authorsService.deleteAuthor(id);
    return new SuccessDto();
  }
}
