import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { Role } from 'src/database/schemas/enums/role.enum';
import { RoleGuard, Roles } from '../guards/role.guard';

export const AUTH_GUARD = Symbol('auth-guard');

export function Auth(options?: { isPublic?: string; permissions?: string[]; roles?: Role[] }) {
  // const guards = [];
  const strategies = options?.isPublic ? [options.isPublic] : ['jwt'];
  const decorators: PropertyDecorator[] = [];
  if (strategies.includes('jwt')) {
    decorators.push(ApiBearerAuth());
  }
  // if (options?.permissions) {
  //   guards.push(Permissions(...options.permissions));
  // }

  if (options?.roles) {
    decorators.push(Roles(...options.roles));
  }

  return applyDecorators(
    SetMetadata(AUTH_GUARD, true),
    ...decorators,
    UseGuards(AuthGuard(strategies), RoleGuard),
    // ...guards,

    ApiUnauthorizedResponse({ description: 'Unauthorized' })
  );
}
