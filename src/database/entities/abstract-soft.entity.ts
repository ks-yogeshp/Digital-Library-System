import { DeleteDateColumn } from 'typeorm';

import { AbstractEntity } from './abstract.entity';

export class AbstractSoftEntity extends AbstractEntity {
  @DeleteDateColumn()
  deletedAt?: Date;
}
