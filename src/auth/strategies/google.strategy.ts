import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth2';
import { VerifiedCallback } from 'passport-jwt';

import { CONFIG } from 'src/config';
import { User } from 'src/database/entities/user.entity';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStratedy extends PassportStrategy(Strategy) {
  constructor(private readonly authservice: AuthService) {
    super({
      clientID: CONFIG.CLIENT_ID,
      clientSecret: CONFIG.CLIENT_SECRET,
      callbackURL: CONFIG.CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: any, done: VerifiedCallback) {
    const { sub, given_name, family_name, email, picture } = profile._json;

    const user = new User();
    user.firstName = given_name;
    user.lastName = family_name;
    user.email = email;
    user.googleId = sub;

    done(null, { ...user, picture });
  }
}
