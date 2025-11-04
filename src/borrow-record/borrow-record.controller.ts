import { ClassSerializerInterceptor, Controller, Get, Query, Res, UseInterceptors } from '@nestjs/common';
import { BorrowRecordService } from './providers/borrow-record.service';
import type { Response } from 'express';
import { PenaltySummaryDto } from './dtos/penalty-Summary.dto';
import { BookActivitySummaryDto } from './dtos/book-activity-summary.dto';
@Controller('borrow-record')
export class BorrowRecordController {

    constructor(

        private readonly borrowRecordService: BorrowRecordService,

    ){}

    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    public getAllUsers(){
        return this.borrowRecordService.getBorrowRecord();
    }

    @Get('penalty')
    public penaltiesSummary(@Query() penaltySummaryDto: PenaltySummaryDto){
        return this.borrowRecordService.getPenatliesSummary(penaltySummaryDto);
    }

    @Get('penalty/export')
    public async exportPenaltiesCSV(@Res() res: Response, @Query() penaltySummaryDto: PenaltySummaryDto){
        const csv = await this.borrowRecordService.exportPenaltiesCSV(penaltySummaryDto);

        res.header('Content-Type', 'text/csv');
        res.attachment('penalties_summary.csv');
        res.send(csv);
    }


    @Get('bookActivitySummary')
    async getBookActivity(@Query() query: BookActivitySummaryDto) {
        return this.borrowRecordService.getBookActivitySummary(query);
    }
}
