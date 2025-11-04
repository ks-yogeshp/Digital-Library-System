import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BorrowRecord } from '../borrow-record.entity';
import { Repository } from 'typeorm';
import { Parser } from 'json2csv';
import { PenaltySummaryDto } from '../dtos/penalty-Summary.dto';
import { BookActivitySummaryDto } from '../dtos/book-activity-summary.dto';
import { category } from 'src/books/enums/category.enum';

@Injectable()
export class BorrowRecordService {

    constructor(

        @InjectRepository(BorrowRecord)
        private readonly borrowRepository: Repository<BorrowRecord>,

    ){}

    public async getBorrowRecord(){
        return await this.borrowRepository.find({
            order:{
                penalty:"DESC"
            }
        });
    }

    public async getPenatliesSummary(penaltySummaryDto: PenaltySummaryDto){
        const query = this.borrowRepository.createQueryBuilder('record')
        .leftJoinAndSelect('record.user', 'user')
            .select('user.id', 'userId')
            .addSelect('user.firstName', 'firstName')
            .addSelect('user.lastName', 'lastName')
            .addSelect('SUM(record.penalty)', 'totalPenalty')      
            .addSelect('user.email','email')
            .groupBy('user.id')
            .orderBy('"totalPenalty"', 'DESC');

        if (penaltySummaryDto.start) query.andWhere('record.createdAt >= :startDate', { startDate:penaltySummaryDto.start });
        if (penaltySummaryDto.end) query.andWhere('record.createdAt <= :endDate', { endDate:penaltySummaryDto.end });
        if (penaltySummaryDto.limit) query.limit(penaltySummaryDto.limit);

        return query.getRawMany()
    }

    public async exportPenaltiesCSV(penaltySummaryDto: PenaltySummaryDto): Promise<string> {
        const data = await this.getPenatliesSummary(penaltySummaryDto);
        const parser = new Parser({ fields: ['userId', 'firstName', 'lastName', 'email', 'totalPenalty'] });
        return parser.parse(data);
    }

    public async getBookActivitySummary(bookActivitySummary:BookActivitySummaryDto){
        console.log(bookActivitySummary.categoryIds)
        const query =await this.borrowRepository.createQueryBuilder('record')
        .leftJoinAndSelect('record.book', 'book')
        .leftJoin('book.authors', 'author') // many-to-many relation
        .select('book.id', 'bookId')
        .addSelect('book.name', 'name')
        .addSelect('book.yearOfPublication', 'year')
        .addSelect('book.category', 'category')
        .addSelect('ARRAY_AGG(DISTINCT author.name)', 'authors')
        .addSelect('COUNT(DISTINCT record.id)', 'borrowCount')
        .groupBy('book.id')
        .orderBy('"borrowCount"', 'DESC');
      
        if (bookActivitySummary.year) {
            query.andWhere('EXTRACT(YEAR FROM record.borrowDate) = :year', { year: bookActivitySummary.year });
        }
    
        if (bookActivitySummary.month) {
          query.andWhere('EXTRACT(MONTH FROM record.borrowDate) = :month', { month: bookActivitySummary.month });
        }
    
        // Filter by start/end date
        if (bookActivitySummary.startDate) {
          query.andWhere('record.borrowDate >= :startDate', { startDate: bookActivitySummary.startDate });
        }
    
        if (bookActivitySummary.endDate) {
          query.andWhere('record.borrowDate <= :endDate', { endDate: bookActivitySummary.endDate });
        }
    
        // Filter by categories (enum)
        if (bookActivitySummary.categoryIds && bookActivitySummary.categoryIds.length > 0) {
          query.andWhere( 'book.category::text[] && ARRAY[:...categories]', { categories: bookActivitySummary.categoryIds });
        }
    
        // Limit results
        if (bookActivitySummary.limit) {
          query.limit(bookActivitySummary.limit);   
        }
        console.log(query.getSql(),query.getParameters())
        return query.getRawMany();
    }

}
