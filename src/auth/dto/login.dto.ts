import { StringField } from 'src/common/decorators/field.decorators';

export class LoginDto {
  @StringField({
    description: 'User email',
    example: 'jondoe@gmail.com',
  })
  email: string;

  @StringField({
    description: 'User password',
    example: 'password',
  })
  password: string;
}
