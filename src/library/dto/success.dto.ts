import { BooleanField } from '../../common/decorators/field.decorators';

export class SuccessDto {
  @BooleanField()
  success: boolean;

  constructor(success: boolean = true) {
    this.success = success;
  }
}
