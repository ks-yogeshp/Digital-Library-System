import { NumberField, NumberFieldOptional } from 'src/common/decorators/field.decorators';
import { Role } from 'src/database/entities/enums/role.enum';
import { AbstractSoftDto } from './abstract-soft.dto';

export class MetadataSoftDto extends AbstractSoftDto {
  @NumberField({
    description: 'Identifier of the user who created the record',
    example: 1,
  })
  createdBy?: number;

  @NumberFieldOptional({
    description: 'Identifier of the user who last updated the record',
    example: 2,
  })
  updatedBy?: number;

  @NumberFieldOptional({
    description: 'Identifier of the user who deleted the record',
    example: 3,
  })
  deletedBy?: number;

  constructor(entity?: Partial<MetadataSoftDto>, role?: Role) {
    super(entity, role);
    if (entity == null) {
      return;
    }
    if (role === Role.ADMIN) {
      this.createdBy = entity.createdBy ?? undefined;
      this.updatedBy = entity.updatedBy ?? undefined;
      this.deletedBy = entity.deletedBy ?? undefined;
    }
  }
}
