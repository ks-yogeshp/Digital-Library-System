import { connect } from 'mongoose';

import { CONFIG } from 'src/config';
import { Author, AuthorSchema } from '../schemas/author.schema';
import { Book, BookSchema } from '../schemas/book.schema';
import { User, UserSchema } from '../schemas/user.schema';
import MongoSeeder from './data.seeder';

async function bootstrap() {
  try {
    const connection = await connect(CONFIG.DATABASE_MONGO_URL);

    connection.model(User.name, UserSchema);
    connection.model(Author.name, AuthorSchema);
    connection.model(Book.name, BookSchema);

    const seeder = new MongoSeeder(connection.connection);
    await seeder.run();

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

void bootstrap();
