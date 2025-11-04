import { setSeederFactory } from "typeorm-extension";
import { faker } from '@faker-js/faker';
import { Author } from "src/authors/author.entity";

export default setSeederFactory(Author, () => {
    const author = new Author();
    author.name = faker.person.fullName();
    author.email = faker.internet.email();
    author.country = faker.location.country();
    return author;
});
