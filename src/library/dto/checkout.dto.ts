import { NumberField, NumberFieldOptional } from '../../common/decorators/field.decorators';

export class CheckoutDto {
  @NumberField({
    description: 'ID of the user borrowing the book',
    example: 1,
    int: true,
    isPositive: true,
  })
  userId: number;

  @NumberFieldOptional({
    description: 'Number of days the book will be borrowed',
    example: 14,
    int: true,
    minimum: 1,
    maximum: 14,
  })
  days: number = 14;
}
