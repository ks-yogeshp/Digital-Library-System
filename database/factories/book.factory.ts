import { setSeederFactory } from 'typeorm-extension';
import { Book } from '../../src/books/book.entity';
import { category } from '../../src/books/enums/category.enum';
import { faker } from '@faker-js/faker';

export default setSeederFactory(Book, () => {
  const book = new Book();
  book.name = faker.lorem.words(3);
  book.ISBN = faker.commerce.isbn(13);
  book.category = faker.helpers.arrayElements(Object.values(category),{ min: 1, max: 4 })
  book.yearOfPublication = faker.date.between({from: '1990',to: '2024'}).getFullYear();
  book.version = faker.system.semver();
  return book;
});
