import type { Response } from 'express';
import { Controller, Query, Res } from '@nestjs/common';

import type { IActiveUser } from 'src/auth/interfaces/active-user.interface';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { IBookWihtBorrowCount } from 'src/database/entities/book.entity';
import { Role } from 'src/database/entities/enums/role.enum';
import { IUserWithPenalty } from 'src/database/entities/user.entity';
import { GetRoute } from './../common/decorators/route.decorators';
import { BookActivitySummaryDto } from './dto/book-activity-summary.dto';
import { BookDtoWithBorrowCount } from './dto/book.dto';
import { BorrowRecordDto } from './dto/borrow-record.dto';
import { PenaltySummaryDto } from './dto/penalty-Summary.dto';
import { UserDtoWithPenalty } from './dto/user.dto';
import { BorrowRecordService } from './services/borrow-record.service';

@Controller('borrow-record')
export class BorrowRecordController {
  constructor(private readonly borrowRecordService: BorrowRecordService) {}

  @Auth({
    roles: [Role.ADMIN, Role.MANAGER],
  })
  @GetRoute('', {
    summary: 'Get all borrow records',
    description: 'Retrieve a list of all borrow records.',
    Ok: {
      description: 'A list of borrow records has been successfully retrieved.',
      type: BorrowRecordDto,
      isArray: true,
    },
  })
  public async getAllUsers(@ActiveUser() user: IActiveUser) {
    const borrowRecords = await this.borrowRecordService.getBorrowRecord();
    return borrowRecords.map((borrowRecord) => new BorrowRecordDto(borrowRecord, user.role));
  }

  @Auth({
    roles: [Role.ADMIN, Role.MANAGER],
  })
  @GetRoute('penalty', {
    summary: 'Get penalties summary',
    description: 'Retrieve a summary of penalties for users based on query parameters.',
    Ok: {
      description: 'A list of users with penalties has been successfully retrieved.',
      type: UserDtoWithPenalty,
      isArray: true,
    },
  })
  public async penaltiesSummary(@Query() penaltySummaryDto: PenaltySummaryDto) {
    const penalties: IUserWithPenalty[] =
      await this.borrowRecordService.getPenatliesSummary(penaltySummaryDto);
    return penalties.map((penalty) => new UserDtoWithPenalty(penalty));
  }

  @Auth({
    roles: [Role.ADMIN, Role.MANAGER],
  })
  @GetRoute('penalty/export', {
    summary: 'Export penalties summary as CSV',
    description: 'Export the penalties summary for users as a CSV file based on query parameters.',
    Ok: {
      description: 'The penalties summary has been successfully exported as a CSV file.',
      type: 'text/csv',
    },
  })
  public async exportPenaltiesCSV(@Res() res: Response, @Query() penaltySummaryDto: PenaltySummaryDto) {
    const csv = await this.borrowRecordService.exportPenaltiesCSV(penaltySummaryDto);

    res.header('Content-Type', 'text/csv');
    res.attachment('penalties_summary.csv');
    res.send(csv);
  }

  @Auth({
    roles: [Role.ADMIN, Role.MANAGER],
  })
  @GetRoute('bookActivitySummary', {
    summary: 'Get book activity summary',
    description: 'Retrieve a summary of book activities based on query parameters.',
    Ok: {
      description: 'A list of books with their activity summary has been successfully retrieved.',
      type: BookDtoWithBorrowCount,
      isArray: true,
    },
  })
  async getBookActivity(@Query() query: BookActivitySummaryDto) {
    const books: IBookWihtBorrowCount[] = await this.borrowRecordService.getBookActivitySummary(query);
    return books.map((book) => new BookDtoWithBorrowCount(book));
  }
}
