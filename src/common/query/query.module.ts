import { Module } from '@nestjs/common';
import { QueryProvider } from './providers/query.provider';
import { SearchQueryProvider } from './providers/search-query.provider';
import { FilterQueryProvider } from './providers/filter-query.provider';

@Module({
  providers: [QueryProvider, SearchQueryProvider, FilterQueryProvider],
  exports: [QueryProvider]
})
export class QueryModule {}
