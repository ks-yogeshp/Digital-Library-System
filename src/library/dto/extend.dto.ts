import { NumberField, NumberFieldOptional } from '../../common/decorators/field.decorators';

export class ExtendDto {
  @NumberField({
    description: 'ID of the user borrowing the book',
    example: 1,
    int: true,
    isPositive: true,
  })
  userId: number;

  @NumberFieldOptional({
    description: 'Number of days the book will be borrowed',
    example: 7,
    int: true,
    minimum: 1,
    maximum: 7,
  })
  days: number = 7;
}
