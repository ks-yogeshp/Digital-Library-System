import { faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';

import { Book } from '../entities/book.entity';
import { Category } from '../entities/enums/category.enum';

export default setSeederFactory(Book, () => {
  const book = new Book();
  book.name = faker.lorem.words(3);
  book.ISBN = faker.commerce.isbn(13);
  book.category = faker.helpers.arrayElements(Object.values(Category), { min: 1, max: 4 });
  book.yearOfPublication = faker.date.between({ from: '1990', to: '2024' }).getFullYear();
  book.version = faker.system.semver();
  return book;
});
