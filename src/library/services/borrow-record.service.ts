import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { Parser } from 'json2csv';

import { BorrowRecordRepository } from 'src/database/repositories/borrow-record.repository';
import { BookActivitySummaryDto } from '../dto/book-activity-summary.dto';
import { PenaltySummaryDto } from '../dto/penalty-Summary.dto';

@Injectable()
export class BorrowRecordService {
  constructor(private readonly borrowRepository: BorrowRecordRepository) {}

  public async getBorrowRecord() {
    return await this.borrowRepository.find({
      order: {
        penalty: 'DESC',
      },
    });
  }

  public async getPenatliesSummary(penaltySummaryDto: PenaltySummaryDto) {
    const query = this.borrowRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.user', 'user')
      .select('user.id', 'id')
      .addSelect('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('SUM(record.penalty)', 'totalPenalty')
      .addSelect('user.email', 'email')
      .groupBy('user.id')
      .having('SUM(record.penalty) > 0')
      .orderBy('"totalPenalty"', 'DESC');

    if (penaltySummaryDto.start)
      query.andWhere('record.createdAt >= :startDate', {
        startDate: format(penaltySummaryDto.start, 'yyyy-MM-dd'),
      });
    if (penaltySummaryDto.end)
      query.andWhere('record.createdAt <= :endDate', {
        endDate: format(penaltySummaryDto.end, 'yyyy-MM-dd'),
      });
    if (penaltySummaryDto.limit) query.limit(penaltySummaryDto.limit);

    return query.getRawMany();
  }

  public async exportPenaltiesCSV(penaltySummaryDto: PenaltySummaryDto): Promise<string> {
    const data = await this.getPenatliesSummary(penaltySummaryDto);
    const parser = new Parser({
      fields: ['id', 'firstName', 'lastName', 'email', 'totalPenalty'],
    });
    return parser.parse(data);
  }

  public async getBookActivitySummary(bookActivitySummary: BookActivitySummaryDto) {
    console.log('bookActivitySummary', bookActivitySummary);
    const query = this.borrowRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.book', 'book')
      .leftJoin('book.authors', 'author')
      .select('book.id', 'id')
      .addSelect('book.name', 'name')
      .addSelect('book.yearOfPublication', 'yearOfPublication')
      .addSelect('book.category', 'category')
      .addSelect('ARRAY_AGG(DISTINCT author.name)', 'authorNames')
      .addSelect('COUNT(DISTINCT record.id)', 'borrowCount')
      .groupBy('book.id')
      .orderBy('"borrowCount"', 'DESC');

    if (bookActivitySummary.year) {
      query.andWhere('EXTRACT(YEAR FROM record.borrowDate) = :year', {
        year: bookActivitySummary.year,
      });
    }

    if (bookActivitySummary.month) {
      query.andWhere('EXTRACT(MONTH FROM record.borrowDate) = :month', {
        month: bookActivitySummary.month,
      });
    }

    if (bookActivitySummary.startDate) {
      query.andWhere('record.borrowDate >= :startDate', {
        startDate: format(bookActivitySummary.startDate, 'yyyy-MM-dd'),
      });
    }

    if (bookActivitySummary.endDate) {
      query.andWhere('record.borrowDate <= :endDate', {
        endDate: format(bookActivitySummary.endDate, 'yyyy-MM-dd'),
      });
    }

    if (bookActivitySummary.categoryIds && bookActivitySummary.categoryIds.length > 0) {
      query.andWhere('book.category::text[] && ARRAY[:...categories]', {
        categories: bookActivitySummary.categoryIds,
      });
    }

    // Limit results
    if (bookActivitySummary.limit) {
      query.limit(bookActivitySummary.limit);
    }
    return query.getRawMany();
  }
}
