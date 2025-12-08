import { faker } from '@faker-js/faker';

import { Author } from '../schemas/author.schema';

const authorFactory = {
  make: () => {
    const author = new Author();
    author.name = faker.person.fullName();
    author.email = faker.internet.email();
    author.country = faker.location.country();
    return author;
  },
  saveMany: async (authorModel, count: number) => {
    const authors: Author[] = [];
    for (let i = 0; i < count; i++) {
      authors.push(authorFactory.make());
    }
    return await authorModel.insertMany(authors);
  },
};

export default authorFactory;
