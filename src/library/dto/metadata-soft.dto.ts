import { StringFieldOptional } from 'src/common/decorators/field.decorators';
import { Role } from 'src/database/schemas/enums/role.enum';
import { MetadataSoftSchema } from 'src/database/schemas/metadata-soft.schema';
import { AbstractSoftDto } from './abstract-soft.dto';

export class MetadataSoftDto extends AbstractSoftDto {
  @StringFieldOptional({
    description: 'Identifier of the user who created the record',
    example: '64e2f3c1b5d9a6a1e2d3f4b5',
  })
  createdBy?: string;

  @StringFieldOptional({
    description: 'Identifier of the user who last updated the record',
    example: '64e2f3c1b5d9a6a1e2d3f4b6',
  })
  updatedBy?: string;

  @StringFieldOptional({
    description: 'Identifier of the user who deleted the record',
    example: '64e2f3c1b5d9a6a1e2d3f4b7',
  })
  deletedBy?: string;

  constructor(model?: Partial<MetadataSoftSchema>, role?: Role) {
    super(model, role);
    if (model == null) {
      return;
    }
    if (role === Role.ADMIN) {
      this.createdBy = model.createdBy?.toString() ?? undefined;
      this.updatedBy = model.updatedBy?.toString() ?? undefined;
      this.deletedBy = model.deletedBy?.toString() ?? undefined;
    }
  }
}
