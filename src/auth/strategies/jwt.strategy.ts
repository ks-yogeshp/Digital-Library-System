import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { CONFIG } from 'src/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: CONFIG.SECRET_KEY,
    });
  }

  validate(payload: any) {
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
