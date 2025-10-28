import { Exclude } from "class-transformer";
import { BorrowRecord } from "src/borrow-record/borrow-record.entity";
import { ReservationRequest } from "src/reservation-request/reservation-request.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: false
    })
    firstName: string;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: true
    })
    lastName?: string;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: false,
        unique: true
    })
    email: string;

    @Column({
        type: 'varchar',
        length: 96,
        nullable: false,
    })
    @Exclude()
    password: string;

    @OneToMany(()=> BorrowRecord, (borrowRecord)=> borrowRecord.user)
    borrowingHistory?: BorrowRecord[];

    @OneToMany(()=> ReservationRequest, (reservationRequest)=> reservationRequest.book)
    reservationHistory?: ReservationRequest[];
    

}