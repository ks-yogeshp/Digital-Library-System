import { Body, Controller, Param, Query } from '@nestjs/common';

import type { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { PageDto } from 'src/common/dtos/page.dto';
import { QueryDto } from 'src/common/dtos/query.dto';
import { Role } from 'src/database/schemas/enums/role.enum';
import { DeleteRoute, GetRoute, PostRoute, PutRoute } from './../common/decorators/route.decorators';
import { AuthorDto, CreateAuthorDto, DetailedAuthorDto, UpdateAuthorDto } from './dto/author.dto';
import { SuccessDto } from './dto/success.dto';
import { AuthorsService } from './services/authors.service';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Auth()
  @GetRoute('', {
    summary: 'Get All Authors',
    description: 'Retrieve a list of all authors with optional pagination and filtering',
    Ok: {
      type: AuthorDto,
      dtoType: 'PageDto',
      isArray: true,
    },
  })
  public async getAllAuthors(@ActiveUser() user: IActiveUser, @Query() queryDto: QueryDto) {
    const authors = await this.authorsService.getAllAuthors(queryDto);
    const result = authors.result.map((author) => new AuthorDto(author, user.role));
    return new PageDto(result, queryDto.page, queryDto.limit, authors.totalItems, authors.newUrl);
  }

  @Auth()
  @GetRoute('{:id}', {
    summary: 'Get Author by ID',
    description: 'Retrieve a single author by their unique ID',
    Ok: DetailedAuthorDto,
  })
  public async getAuthorById(@Param('id') id: string, @ActiveUser() user: IActiveUser) {
    const author = await this.authorsService.getAuthorById(id);
    return new DetailedAuthorDto(author, user.role);
  }

  @Auth({ roles: [Role.ADMIN, Role.MANAGER] })
  @PostRoute('', {
    summary: 'Create New Author',
    description: 'Create a new author with the provided details',
    Created: DetailedAuthorDto,
  })
  public async createAuthor(@ActiveUser() user: IActiveUser, @Body() createAuthorDto: CreateAuthorDto) {
    const author = await this.authorsService.createAuthor(user, createAuthorDto);
    return new DetailedAuthorDto(author, user.role);
  }

  @Auth({ roles: [Role.ADMIN, Role.MANAGER] })
  @PutRoute('{:id}', {
    summary: 'Update Author',
    description: 'Update the details of an existing author by their ID',
    Ok: DetailedAuthorDto,
  })
  public async updateAuthor(
    @Param('id') id: string,
    @ActiveUser() user: IActiveUser,
    @Body() updateAuthorDto: UpdateAuthorDto
  ) {
    const author = await this.authorsService.updateAuthor(id, user, updateAuthorDto);
    return new DetailedAuthorDto(author, user.role);
  }

  @Auth({ roles: [Role.ADMIN] })
  @DeleteRoute('{:id}', {
    summary: 'Delete Author',
    description: 'Delete an author by their unique ID',
    Ok: SuccessDto,
  })
  public async deleteAuthor(@Param('id') id: string, @ActiveUser() user: IActiveUser) {
    await this.authorsService.deleteAuthor(id, user);
    return new SuccessDto();
  }
}
