import { Column } from 'typeorm';

import { AbstractSoftEntity } from './abstract-soft.entity';

export class MetadataSoft extends AbstractSoftEntity {
  @Column({
    type: 'int',
    nullable: true,
  })
  createdBy: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  updatedBy?: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  deletedBy?: number;
}
