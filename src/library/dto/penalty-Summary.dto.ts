import { DateFieldOptional, NumberFieldOptional } from '../../common/decorators/field.decorators';

export class PenaltySummaryDto {
  @DateFieldOptional({
    description: 'Start date for filtering penalties (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  start?: string;

  @DateFieldOptional({
    description: 'End date for filtering penalties (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  end?: string;

  @NumberFieldOptional({
    description: 'Number of user',
    example: 10,
    int: true,
    minimum: 1,
  })
  limit?: number;
}
