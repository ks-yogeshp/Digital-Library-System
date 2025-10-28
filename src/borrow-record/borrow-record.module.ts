import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowRecord } from './borrow-record.entity';

@Module({
    imports:[TypeOrmModule.forFeature([BorrowRecord])]
})
export class BorrowRecordModule {}
