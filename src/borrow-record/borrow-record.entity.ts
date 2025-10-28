import { BSON, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { bookStatus } from "./enums/bookStatus.enum";
import { Book } from "src/books/book.entity";
import { User } from "src/users/user.entity";

@Entity()
export class BorrowRecord{

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(()=> Book, (book)=> book.borrowingHistory)
    @JoinColumn({name: 'bookId'})
    book: Book;

    @ManyToOne(()=> User, (user)=> user.borrowingHistory)
    @JoinColumn({name: 'userId'})
    user: User;

    @Column({
        type: 'timestamp',
        nullable: false,
    })
    borrowDate: Date;

    @Column({
        type: 'timestamp',
        nullable: false,
    })
    dueDate: Date;

    @Column({
        type: 'timestamp',
        nullable: false,
    })
    returnDate: Date;

    @Column({
        type:'integer',
        nullable:true,
    })
    penaltiy?: number;

    @Column({
        type: 'enum',
        enum: bookStatus,
        default: bookStatus.BORROWED,
    })
    bookStatus: bookStatus;
}