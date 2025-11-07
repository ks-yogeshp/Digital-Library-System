import { Author } from "src/authors/author.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { availabilityStatus } from "./enums/availibityStatus.enum";
import { category } from "./enums/category.enum";
import { BorrowRecord } from "src/borrow-record/borrow-record.entity";
import { ReservationRequest } from "src/reservation-request/reservation-request.entity";

@Entity()
export class Book{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: false
    })
    name: string;

    @Column({
        type: 'varchar',
        length:20,
        nullable: false,
        unique: true
    })
    ISBN: string;

    @Column({
        type: 'enum',
        enum: category,
        array: true,
        nullable: false,
        default: [category.OTHER]
    })
    category: category[];

    @ManyToMany(()=> Author, (author)=> author.books,{onDelete:"CASCADE"})
    @JoinTable()
    authors: Author[];

    @Column({
        type: 'integer',
        // length: 4,
        nullable: false,
    })
    yearOfPublication: number;

    @Column({
        type: 'varchar',
        length: 20,
        nullable: false
    })
    version: string;

    @Column({
        type: 'enum',
        enum: availabilityStatus,
        default: availabilityStatus.AVAILABLE,
    })
    availabilityStatus: availabilityStatus;

    @OneToMany(()=> BorrowRecord, (borrowRecord)=> borrowRecord.book,{
        onDelete:'SET NULL'
    })
    borrowingHistory?: BorrowRecord[];

    @OneToMany(()=> ReservationRequest, (reservationRequest)=> reservationRequest.book,{
        onDelete:"SET NULL"
    })
    reservationHistory?: ReservationRequest[];
}