import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import { User } from 'src/users/user.entity';

export default setSeederFactory(User, () => {
  const user = new User();
  user.firstName = faker.person.firstName();
  user.lastName = faker.person.lastName();
  user.email = faker.internet.email({firstName:user.firstName,lastName:user.lastName});
  user.password = 'password'
  return user;
});
