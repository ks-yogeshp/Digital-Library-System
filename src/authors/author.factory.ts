import { setSeederFactory } from "typeorm-extension";
import { Author } from "./author.entity";
import { faker } from '@faker-js/faker';

export default setSeederFactory(Author, () => {
    const author = new Author();
    author.name = faker.person.fullName();
    author.email = faker.internet.email();
    author.country = faker.location.country();
    return author;
});
