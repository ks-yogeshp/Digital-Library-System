import { Injectable } from '@nestjs/common';
import { Parser } from 'json2csv';
import { PipelineStage } from 'mongoose';

import { BorrowRecordRepository } from 'src/database/repositories/borrow-record.repository';
import { BookActivitySummaryDto } from '../dto/book-activity-summary.dto';
import { PenaltySummaryDto } from '../dto/penalty-Summary.dto';

@Injectable()
export class BorrowRecordService {
  constructor(private readonly borrowRecordRepository: BorrowRecordRepository) {}

  public async getBorrowRecord() {
    return await this.borrowRecordRepository.query().find().sort({ penalty: -1 });
  }

  public async getPenatliesSummary(penaltySummaryDto: PenaltySummaryDto) {
    const matchStage: any = {};

    if (penaltySummaryDto.start) {
      matchStage.createdAt = { $gte: new Date(penaltySummaryDto.start) };
    }
    if (penaltySummaryDto.end) {
      matchStage.createdAt = matchStage.createdAt || {};
      matchStage.createdAt.$lte = new Date(penaltySummaryDto.end);
    }
    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user._id',
          firstName: { $first: '$user.firstName' },
          lastName: { $first: '$user.lastName' },
          email: { $first: '$user.email' },
          totalPenalty: { $sum: '$penalty' },
        },
      },
      { $match: { totalPenalty: { $gt: 0 } } },
      { $sort: { totalPenalty: -1 } },
      {
        $project: {
          id: '$_id',
          firstName: 1,
          lastName: 1,
          email: 1,
          totalPenalty: 1,
          _id: 0,
        },
      },
    ];
    if (penaltySummaryDto.limit) {
      pipeline.push({ $limit: penaltySummaryDto.limit });
    }

    return this.borrowRecordRepository.query().aggregate(pipeline).exec();
  }

  public async exportPenaltiesCSV(penaltySummaryDto: PenaltySummaryDto): Promise<string> {
    const data = await this.getPenatliesSummary(penaltySummaryDto);
    const parser = new Parser({
      fields: ['id', 'firstName', 'lastName', 'email', 'totalPenalty'],
    });
    return parser.parse(data);
  }

  public async getBookActivitySummary(bookActivitySummary: BookActivitySummaryDto) {
    const matchStage: Record<string, any> = {};
    if (bookActivitySummary.startDate) {
      matchStage.borrowDate = { $gte: new Date(bookActivitySummary.startDate) };
    }
    if (bookActivitySummary.endDate) {
      matchStage.borrowDate = matchStage.borrowDate || {};
      matchStage.borrowDate.$lte = new Date(bookActivitySummary.endDate);
    }

    if (bookActivitySummary.year) {
      matchStage.$expr = {
        $eq: [{ $year: '$borrowDate' }, bookActivitySummary.year],
      };
    }
    if (bookActivitySummary.month) {
      matchStage.$expr = matchStage.$expr || {};
      matchStage.$expr = {
        ...matchStage.$expr,
        $eq: [{ $month: '$borrowDate' }, bookActivitySummary.month],
      };
    }

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
      {
        $lookup: {
          from: 'authors',
          localField: 'book.authors',
          foreignField: '_id',
          as: 'authors',
        },
      },
      ...(bookActivitySummary.categoryIds?.length
        ? [
            {
              $match: {
                'book.category': { $in: bookActivitySummary.categoryIds },
              },
            },
          ]
        : []),
      {
        $group: {
          _id: '$book._id',
          name: { $first: '$book.name' },
          yearOfPublication: { $first: '$book.yearOfPublication' },
          category: { $first: '$book.category' },
          authorNames: { $addToSet: '$authors.name' },
          borrowCount: { $sum: 1 },
        },
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          yearOfPublication: 1,
          category: 1,
          borrowCount: 1,
          authorNames: {
            $setUnion: ['$authorNames', []],
          },
          _id: 0,
        },
      },
      { $sort: { borrowCount: -1 } },
    ];
    if (bookActivitySummary.limit) {
      pipeline.push({ $limit: bookActivitySummary.limit });
    }

    return this.borrowRecordRepository.query().aggregate(pipeline).exec();
  }
}
