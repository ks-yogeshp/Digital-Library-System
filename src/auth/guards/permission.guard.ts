import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { CONFIG } from 'src/config';
import { Role } from 'src/database/schemas/enums/role.enum';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractRequestFromHeader(request);
    if (token) {
      const user = await this.jwtService.verifyAsync(token, { secret: CONFIG.SECRET_KEY });
      if (request.body.role !== Role.STUDENT) {
        if (request.body.role === Role.MANAGER && user.role === Role.ADMIN) {
          return true;
        }
      } else {
        return true;
      }
    } else {
      if (request.body.role === Role.STUDENT) {
        return true;
      }
    }

    return false;
  }
  private extractRequestFromHeader(request: Request): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, token] = request.headers['authorization']?.split(' ') ?? [];
    return token;
  }
}
