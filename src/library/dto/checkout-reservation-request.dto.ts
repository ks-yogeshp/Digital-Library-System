import { NumberFieldOptional } from '../../common/decorators/field.decorators';

export class CheckoutReservationRequestDto {
  @NumberFieldOptional({
    description: 'Number of days the book will be borrowed',
    example: 14,
    int: true,
    minimum: 1,
    maximum: 14,
  })
  days: number = 14;
}
