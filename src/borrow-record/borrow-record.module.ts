import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowRecord } from './borrow-record.entity';
import { BorrowRecordController } from './borrow-record.controller';
import { BorrowRecordService } from './providers/borrow-record.service';

@Module({
    imports:[TypeOrmModule.forFeature([BorrowRecord])],
    controllers: [BorrowRecordController],
    providers: [BorrowRecordService]
})
export class BorrowRecordModule {}
