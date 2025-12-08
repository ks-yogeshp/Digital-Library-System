import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { SoftDeletePlugin } from '../plugins/soft-delete.plugin';
import { BookDocument } from './book.schema';
import { MetadataSoftSchema } from './metadata-soft.schema';

export type AuthorDocument = HydratedDocument<Author>;

@Schema({ timestamps: true })
export class Author extends MetadataSoftSchema {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    required: false,
  })
  country?: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Book' }],
    required: false,
  })
  books?: (Types.ObjectId | BookDocument)[];
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
AuthorSchema.plugin(SoftDeletePlugin);
