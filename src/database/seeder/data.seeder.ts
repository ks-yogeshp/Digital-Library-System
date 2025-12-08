import { faker } from '@faker-js/faker';
import { Connection } from 'mongoose';

import authorFactory from '../factories/author.factory';
import bookFactory from '../factories/book.factory';
import userFactory from '../factories/user.factory';
import { Author, AuthorDocument } from '../schemas/author.schema';
import { Book, BookDocument } from '../schemas/book.schema';
import { User } from '../schemas/user.schema';

export default class MongoSeeder {
  constructor(private readonly connection: Connection) {}
  public async run(): Promise<void> {
    // const userFactory = factoryManager.get(User);
    // const authorFactory = factoryManager.get(Author);
    // const bookFactory = factoryManager.get(Book);

    const userModel = this.connection.model(User.name);
    const authorModel = this.connection.model(Author.name);
    const bookModel = this.connection.model(Book.name);

    await userFactory.saveMany(userModel, 50);

    const authors: AuthorDocument[] = await authorFactory.saveMany(authorModel, 20);

    for (let i = 0; i < 300; i++) {
      const book = bookFactory.make();
      book.authors = faker.helpers
        .arrayElements(authors, { min: 1, max: 3 })
        .map((author) => author._id as any);
      const savedBook: BookDocument = await bookModel.insertOne(book);
      if (savedBook.authors) {
        for (const author of savedBook.authors) {
          await authorModel.updateOne({ _id: author }, { $push: { books: savedBook._id } });
        }
      }
    }
  }
}
