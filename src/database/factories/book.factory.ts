import { faker } from '@faker-js/faker';

import { Book } from '../schemas/book.schema';
import { Category } from '../schemas/enums/category.enum';

const bookFactory = {
  make: () => {
    const book = new Book();
    book.name = faker.lorem.words(3);
    book.ISBN = faker.commerce.isbn(13);
    book.category = faker.helpers.arrayElements(Object.values(Category), { min: 1, max: 4 });
    book.yearOfPublication = faker.date.between({ from: '1990', to: '2024' }).getFullYear();
    book.version = faker.system.semver();
    return book;
  },
  saveMany: async (authorModel, count: number) => {
    const authors: Book[] = [];
    for (let i = 0; i < count; i++) {
      authors.push(bookFactory.make());
    }
    return await authorModel.insertMany(authors);
  },
};

export default bookFactory;
