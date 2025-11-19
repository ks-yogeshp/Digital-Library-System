import { NumberField } from '../../common/decorators/field.decorators';

export class ReturnDto {
  @NumberField({
    description: 'ID of the book to borrow',
    example: 1,
    int: true,
    isPositive: true,
  })
  userId: number;
}
