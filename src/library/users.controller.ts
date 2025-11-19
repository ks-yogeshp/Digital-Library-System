import { Body, Controller, Param, ParseIntPipe, Query } from '@nestjs/common';

import { PageDto } from 'src/common/dtos/page.dto';
import { QueryDto } from 'src/common/dtos/query.dto';
import { DeleteRoute, GetRoute, PostRoute, PutRoute } from './../common/decorators/route.decorators';
import { SuccessDto } from './dto/success.dto';
import { CreateUserDto, DetailedUserDto, UpdateUserDto, UserDto } from './dto/user.dto';
import { UsersService } from './services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GetRoute('', {
    summary: 'Get all users',
    description: 'Retrieve a list of all users with optional pagination and filtering.',
    Ok: {
      description: 'A list of users has been successfully retrieved.',
      type: UserDto,
      dtoType: 'PageDto',
      isArray: true,
    },
  })
  public async getAllUsers(@Query() queryDto: QueryDto) {
    const users = await this.usersService.getAllUsers(queryDto);
    const result = users.result.map((user) => new UserDto(user));
    return new PageDto(result, queryDto.page, queryDto.limit, users.totalItems, users.newUrl);
  }

  @GetRoute('{:id}', {
    summary: 'Get user by ID',
    description: 'Retrieve detailed information about a specific user by their ID.',
    Ok: DetailedUserDto,
  })
  public async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.getUserById(id);
    return DetailedUserDto.toDto(user);
  }

  @PostRoute('', {
    summary: 'Create a new user',
    description: 'Add a new user to the system.',
    Created: DetailedUserDto,
  })
  public async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    return DetailedUserDto.toDto(user);
  }

  @PutRoute('{:id}', {
    summary: 'Update user details',
    description: 'Update the information of an existing user by their ID.',
    Ok: DetailedUserDto,
  })
  public async updateUser(@Param('id', ParseIntPipe) id: number, @Body() upadateUserDto: UpdateUserDto) {
    const user = await this.usersService.updateUser(id, upadateUserDto);
    return DetailedUserDto.toDto(user);
  }

  @DeleteRoute('{:id}', {
    summary: 'Delete a user',
    description: 'Remove a user from the system by their ID.',
    Ok: SuccessDto,
  })
  public deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
