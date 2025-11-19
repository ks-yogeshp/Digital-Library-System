import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { QueryDto } from 'src/common/dtos/query.dto';
import { QueryService } from 'src/common/query/query.service';
import { UserRepository } from 'src/database/repositories/user.repository';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly userRepository: UserRepository,

    private readonly queryProvider: QueryService
  ) {}

  public async getAllUsers(queryDto: QueryDto) {
    let users;
    try {
      users = await this.queryProvider.query({
        query: queryDto,
        repository: this.userRepository,
      });
    } catch (error) {
      Logger.error({ msg: 'Error fetching users', error: error.message, stack: error.stack });
      throw error;
    }
    return users;
  }

  public async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        borrowingHistory: true,
        reservationHistory: true,
      },
    });
    if (!user) throw new NotFoundException('User not Found');

    return user;
  }

  public async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (existingUser) throw new BadRequestException('User already exists with this email');

    const newUser = this.userRepository.create(createUserDto);
    await this.userRepository.save(newUser);
    return newUser;
  }

  public async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const existingUser = await this.userRepository.findOneBy({
      id: id,
    });

    if (!existingUser) throw new NotFoundException('User does not exist with this Id');

    existingUser.firstName = updateUserDto.firstName ?? existingUser.firstName;
    existingUser.lastName = updateUserDto.lastName ?? existingUser.lastName;

    await this.userRepository.save(existingUser);
    return existingUser;
  }

  public async deleteUser(id: number) {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) throw new NotFoundException('User does not exist with this Id');

    return { message: 'User deleted successfully' };
  }
}
