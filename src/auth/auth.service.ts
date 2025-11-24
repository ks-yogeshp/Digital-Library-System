import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from 'src/database/entities/user.entity';
import { UserRepository } from 'src/database/repositories/user.repository';
import { CreateUserDto } from 'src/library/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  public async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) return null;
    if (!user.password) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? user : null;
  }

  public login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  public async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    if (existingUser) throw new BadRequestException('User already exists with this email');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = new User();
    newUser.firstName = createUserDto.firstName;
    newUser.lastName = createUserDto.lastName;
    newUser.email = createUserDto.email;
    newUser.password = hashedPassword;
    newUser.role = createUserDto.role;
    await this.userRepository.save(newUser);
    return newUser;
  }

  async googleLoginIn(user: User) {
    const existingUser = await this.userRepository.findOneBy({ email: user.email });
    if (!existingUser) {
      const newUser = new User();
      newUser.firstName = user.firstName;
      newUser.lastName = user.lastName;
      newUser.email = user.email;
      newUser.googleId = user.googleId;
      await this.userRepository.save(newUser);
      user = newUser;
    } else {
      if (!existingUser.googleId) {
        existingUser.googleId = user.googleId;
        await this.userRepository.save(existingUser);
      }
      user = existingUser;
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    return this.jwtService.sign(payload);
  }
}
