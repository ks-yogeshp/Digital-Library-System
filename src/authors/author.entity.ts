import { Book } from "src/books/book.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Author{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type:'varchar',
        length: 96,
        nullable: false
    })
    name: string;

    @Column({
        type:'varchar',
        length: 96,
        nullable: false,
        unique: true
    })
    email: string;

    @Column({
        type:'varchar',
        length: 96,
        nullable: true
    })
    country?: string;

    @ManyToMany(()=> Book, (book)=> book.authors,{onDelete:"CASCADE"})
    books?: Book[];

}