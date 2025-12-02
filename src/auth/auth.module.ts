import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CONFIG } from 'src/config';
import { DatabaseModule } from 'src/database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStratedy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: CONFIG.SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    }),
    DatabaseModule.forRoot(),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStratedy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
