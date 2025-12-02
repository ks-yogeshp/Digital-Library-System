import type { Response } from 'express';
import { Body, Controller, Get, Req, Request, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { PostRoute } from 'src/common/decorators/route.decorators';
import { CreateUserDto, UserDto } from 'src/library/dto/user.dto';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { LoginDto } from './dto/login.dto';
import { PermissionGuard } from './guards/permission.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Auth({ isPublic: 'local' })
  @ApiBody({ type: LoginDto })
  @PostRoute('login', {
    summary: 'User login',
    description: 'Authenticate a user and return a JWT token.',
    Ok: {
      description: 'User successfully logged in.',
      type: Object,
    },
  })
  login(@Request() res) {
    return this.authService.login(res.user);
  }

  @ApiBearerAuth()
  @UseGuards(PermissionGuard)
  @PostRoute('sign-up', {
    summary: 'Create a new user',
    description: 'Add a new user to the system.',
    Created: UserDto,
  })
  public async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.createUser(createUserDto);
    return new UserDto(user);
  }

  @Get('google')
  @Auth({
    isPublic: 'google',
  })
  auth() {
    return {};
  }

  @Get('google/callback')
  @Auth({
    isPublic: 'google',
  })
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const token = await this.authService.googleLoginIn(req.user);
    return res.redirect(`http://localhost:3500?token=${token}`);

    // res.cookie('access_token', token, {
    //   maxAge: 30 * 24 * 60 * 60 * 1000,
    //   sameSite: 'none',
    //   secure: true,
    //   httpOnly: true,
    // });
    // try{
    //   return res.redirect(`http://localhost:3500?token=${token}`);
    // }
    // catch(err){
    //   Logger.error('Redirection error:', err);
    // }
  }
}
