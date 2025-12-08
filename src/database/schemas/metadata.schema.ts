import { Prop } from '@nestjs/mongoose';

import { AbstractSchema } from './abstract.schema';

export class MetadataSchema extends AbstractSchema {
  @Prop({ type: String, default: null })
  createdBy?: string;

  @Prop({ type: String, default: null })
  updatedBy?: string;

  @Prop({ type: String, default: null })
  deletedBy?: string;
}
