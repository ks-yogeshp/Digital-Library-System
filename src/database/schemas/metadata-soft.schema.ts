import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { AbstractSoftSchema } from './abstract-soft.schema';

export class MetadataSoftSchema extends AbstractSoftSchema {
  @Prop({ type: Types.ObjectId, default: null })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null })
  deletedBy?: Types.ObjectId;
}
