import { Types } from 'mongoose';

import { Role } from 'src/database/schemas/enums/role.enum';

export interface IActiveUser {
  sub: Types.ObjectId;

  email: string;

  role: Role;
}
