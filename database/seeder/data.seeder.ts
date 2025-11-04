import { Author } from "src/authors/author.entity";
import { Book } from "src/books/book.entity";
import { User } from "src/users/user.entity";
import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { faker } from '@faker-js/faker';
 
export default class DataSeeder implements Seeder{

    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {

        const userFactory = factoryManager.get(User);
        const authorFactory = factoryManager.get(Author);
        const bookFactory = factoryManager.get(Book);

        const users = await userFactory.saveMany(50);
        const authors = await authorFactory.saveMany(20);

        for(let i = 0; i < 300 ; i++){
            const book = await bookFactory.make();
            book.authors = faker.helpers.arrayElements(authors,{min:1,max:4});
            await dataSource.getRepository(Book).save(book);
        }
    }

    

}