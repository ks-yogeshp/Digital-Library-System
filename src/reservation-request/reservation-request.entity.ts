import { Book } from "src/books/book.entity";
import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { requestStatus } from "./enums/requestStatus.enum";

@Entity()
export class ReservationRequest {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(()=> Book, (book)=> book.reservationHistory,{
        nullable:true,
        onDelete:"SET NULL"
    })
    @JoinColumn({name: 'bookId'})
    book: Book;

    @ManyToOne(()=> User, (user)=> user.reservationHistory,{
        nullable:true,
        onDelete:"SET NULL"
    })
    @JoinColumn({name: 'userId'})
    user: User;

    @CreateDateColumn()
    requestDate: Date;

    @Column({
        type:'enum',
        enum:requestStatus,
        default:requestStatus.PENDING,
    })
    requestStatus: requestStatus;

    @Column({
        type: 'timestamp', 
        nullable: true 
    })
    active_until: Date;
}