import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { MyEntityMap } from 'src/app.types';
import { QueryDto } from 'src/common/dtos/query.dto';
import { QueryService } from 'src/common/query/query.service';
import { AuthorRepository } from 'src/database/repositories/author.repository';
import { Author } from '../../database/entities/author.entity';
import { CreateAuthorDto, UpdateAuthorDto } from '../dto/author.dto';

@Injectable()
export class AuthorsService {
  constructor(
    private readonly authorRepository: AuthorRepository,

    private readonly queryProvider: QueryService
  ) {}

  public async getAllAuthors(queryDto: QueryDto) {
    try {
      return await this.queryProvider.query<Author, MyEntityMap>({
        query: queryDto,
        repository: this.authorRepository,
        searchFieldMap: {
          Author: ['name', 'email'],
        },
        partial: {
          search: false,
        },
      });
    } catch (error) {
      Logger.error({ msg: 'Error fetching authors', error: error.message, stack: error.stack });
      throw error;
    }
  }

  public async getAuthorById(id: number): Promise<Author> {
    const auhtor = await this.authorRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        books: true,
      },
    });
    if (!auhtor) throw new NotFoundException('Auhtor not Found');

    return auhtor;
  }

  public async createAuthor(createAuthorDto: CreateAuthorDto) {
    const existingAuthor = await this.authorRepository.findOneBy({
      email: createAuthorDto.email,
    });

    if (existingAuthor) throw new BadRequestException('Author already exists with this email');

    const newAuthor = new Author();
    newAuthor.name = createAuthorDto.name;
    newAuthor.email = createAuthorDto.email;
    newAuthor.country = createAuthorDto.country;

    await this.authorRepository.save(newAuthor);

    return newAuthor;
  }

  public async updateAuthor(id: number, updateAuthorDto: UpdateAuthorDto) {
    const existingAuthor = await this.authorRepository.findOneBy({
      id: id,
    });

    if (!existingAuthor) throw new NotFoundException('Author does not exist with this Id');

    existingAuthor.name = updateAuthorDto.name ?? existingAuthor.name;
    existingAuthor.country = updateAuthorDto.country ?? existingAuthor.country;

    await this.authorRepository.save(existingAuthor);

    return existingAuthor;
  }

  public async deleteAuthor(id: number) {
    const result = await this.authorRepository.delete(id);

    if (result.affected === 0) throw new NotFoundException('Author does not exist with this Id');

    return { message: 'Author deleted successfully' };
  }
}
