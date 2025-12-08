import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isEmpty } from 'lodash';

import { Role } from 'src/database/schemas/enums/role.enum';

export const RoleSymbol = 'userRole';
export type RolesType = Role;
export const Roles = (...types: RolesType[]) => SetMetadata(RoleSymbol, types);

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<RolesType[] | null>(RoleSymbol, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isEmpty(roles) || !roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // if (user.role === 'admin') {
    //   return true;
    // }

    return roles.includes(user.role as RolesType);
  }
}
