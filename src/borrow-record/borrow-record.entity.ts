import { BSON, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { bookStatus } from "./enums/bookStatus.enum";
import { Book } from "src/books/book.entity";
import { User } from "src/users/user.entity";

@Entity()
export class BorrowRecord{

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(()=> Book, (book)=> book.borrowingHistory,{
        nullable:true,
        onDelete:"SET NULL"
    })
    @JoinColumn({name: 'bookId'})
    book: Book;

    @ManyToOne(()=> User, (user)=> user.borrowingHistory,{
        nullable:true,
        onDelete:"SET NULL"
    })
    @JoinColumn({name: 'userId'})
    user: User;

    @Column({
        type: 'date',
        nullable: false,
    })
    borrowDate: Date;

    @Column({
        type: 'date',
        nullable: false,
    })
    dueDate: Date;

    @Column({
        type: 'date',
        nullable:true
    })
    returnDate?: Date;

    @Column({
        type:'integer',
        default:0,
    })
    penalty?: number;

    @Column({
        type:'boolean',
        nullable:true,
    })
    penaltyPaid?: boolean;

    @Column({
        type: 'integer',
        nullable: false,
        default: 0,
    })
    extensionCount: number;

    @Column({
        type: 'enum',
        enum: bookStatus,
        default: bookStatus.BORROWED,
    })
    bookStatus: bookStatus;
}