import { Module } from '@nestjs/common';
import { QueryProvider } from './providers/query.provider';

@Module({
  providers: [QueryProvider],
  exports: [QueryProvider]
})
export class QueryModule {}
