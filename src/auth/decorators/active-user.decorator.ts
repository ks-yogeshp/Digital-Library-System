import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IActiveUser } from '../interfaces/active-user.interface';

export const ActiveUser = createParamDecorator(
  (field: keyof IActiveUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: IActiveUser = request['user'];
    return field ? user?.[field] : user;
  }
);
