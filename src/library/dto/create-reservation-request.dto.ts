import { NumberField } from '../../common/decorators/field.decorators';

export class CreateReservationRequestDto {
  @NumberField({
    description: 'ID of the user borrowing the book',
    example: 1,
    int: true,
    isPositive: true,
  })
  userId: number;
}
