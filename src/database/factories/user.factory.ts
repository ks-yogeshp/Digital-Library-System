import { faker } from '@faker-js/faker';

import { User } from '../schemas/user.schema';

const userFactory = {
  make: () => {
    const user = new User();
    user.firstName = faker.person.firstName();
    user.lastName = faker.person.lastName();
    user.email = faker.internet.email({ firstName: user.firstName, lastName: user.lastName });
    user.password = '$2b$10$omoKY/3ezDGs8.I7.zXZQurqoTm9Hes7xyhCMMCmiD329LD/0Xmiq';
    return user;
  },
  saveMany: async (userModel, count: number) => {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      users.push(userFactory.make());
    }
    return await userModel.insertMany(users);
  },
};

export default userFactory;
