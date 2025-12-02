import { Body, Controller, Query } from '@nestjs/common';

import type { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { PageDto } from 'src/common/dtos/page.dto';
import { QueryDto } from 'src/common/dtos/query.dto';
import { Role } from 'src/database/entities/enums/role.enum';
import { DeleteRoute, GetRoute, PutRoute } from './../common/decorators/route.decorators';
import { SuccessDto } from './dto/success.dto';
import { DetailedUserDto, UpdateUserDto, UserDto } from './dto/user.dto';
import { UsersService } from './services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth({
    roles: [Role.ADMIN, Role.MANAGER],
  })
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
  public async getAllUsers(@Query() queryDto: QueryDto, @ActiveUser() activeUser: IActiveUser) {
    const users = await this.usersService.getAllUsers(queryDto);
    const result = users.result.map((user) => new UserDto(user, activeUser.role));
    return new PageDto(result, queryDto.page, queryDto.limit, users.totalItems, users.newUrl);
  }

  @Auth({
    roles: [Role.STUDENT],
  })
  @GetRoute('profile', {
    summary: 'Get user by ID',
    description: 'Retrieve detailed information about a specific user by their ID.',
    Ok: DetailedUserDto,
  })
  public async getUserById(@ActiveUser() activeUser: IActiveUser) {
    const user = await this.usersService.getUserById(activeUser.sub);
    return DetailedUserDto.toDto(user);
  }

  // @Auth()
  // @PostRoute('', {
  //   summary: 'Create a new user',
  //   description: 'Add a new user to the system.',
  //   Created: DetailedUserDto,
  // })
  // public async createUser(@Body() createUserDto: CreateUserDto) {
  //   const user = await this.usersService.createUser(createUserDto);
  //   return DetailedUserDto.toDto(user);
  // }

  @Auth()
  @PutRoute('update', {
    summary: 'Update user details',
    description: 'Update the information of an existing user by their ID.',
    Ok: DetailedUserDto,
  })
  public async updateUser(@ActiveUser() activeUser: IActiveUser, @Body() upadateUserDto: UpdateUserDto) {
    const user = await this.usersService.updateUser(activeUser.sub, upadateUserDto);
    return DetailedUserDto.toDto(user);
  }

  @Auth()
  @DeleteRoute('delete', {
    summary: 'Delete a user',
    description: 'Remove a user from the system by their ID.',
    Ok: SuccessDto,
  })
  public deleteUser(@ActiveUser() activeUser: IActiveUser) {
    return this.usersService.deleteUser(activeUser.sub);
  }
}
