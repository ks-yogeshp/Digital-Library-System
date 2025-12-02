import { NumberFieldOptional } from '../../common/decorators/field.decorators';

export class ExtendDto {
  @NumberFieldOptional({
    description: 'Number of days the book will be borrowed',
    example: 7,
    int: true,
    minimum: 1,
    maximum: 7,
  })
  days: number = 7;
}
