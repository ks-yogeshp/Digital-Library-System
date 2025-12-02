import { Column } from 'typeorm';

import { AbstractEntity } from './abstract.entity';

export class Metadata extends AbstractEntity {
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
