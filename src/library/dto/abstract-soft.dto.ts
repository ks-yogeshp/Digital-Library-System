import { DateField, DateFieldOptional } from 'src/common/decorators/field.decorators';
import { Role } from 'src/database/entities/enums/role.enum';

type BaseDtoInterface = AbstractSoftDto;
export class AbstractSoftDto {
  @DateField({
    description: 'Record creation timestamp',
    example: '2024-01-01T12:00:00Z',
  })
  createdAt?: Date;

  @DateFieldOptional({
    description: 'Record last update timestamp',
    example: '2024-01-02T15:30:00Z',
  })
  updatedAt?: Date;

  @DateFieldOptional({
    description: 'Record deletion timestamp',
    example: '2024-01-03T10:20:00Z',
  })
  deletedAt?: Date;

  constructor(entity?: Partial<BaseDtoInterface>, role?: Role) {
    if (entity == null) {
      return;
    }

    if (role ? [Role.ADMIN, Role.MANAGER].includes(role) : false) {
      this.createdAt = entity.createdAt ?? undefined;
      this.updatedAt = entity.updatedAt ?? undefined;
      this.deletedAt = entity.deletedAt ?? undefined;
    }
  }
}
