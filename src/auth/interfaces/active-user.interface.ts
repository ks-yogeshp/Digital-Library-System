import { Role } from 'src/database/entities/enums/role.enum';

export interface IActiveUser {
  sub: number;

  email: string;

  role: Role;
}
