import { Prop } from '@nestjs/mongoose';

import { AbstractSchema } from './abstract.schema';

export class AbstractSoftSchema extends AbstractSchema {
  @Prop({ default: null })
  deletedAt?: Date;
}
