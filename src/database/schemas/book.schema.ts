import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { AuthorDocument } from './author.schema';
import { AvailabilityStatus } from './enums/availibity-status.enum';
import { Category } from './enums/category.enum';
import { MetadataSoftSchema } from './metadata-soft.schema';
import { BorrowRecordDocument } from './borrow-record.schema';
import { ReservationRequestDocument } from './reservation-request.schema';
import { SoftDeletePlugin } from '../plugins/soft-delete.plugin';

export type BookDocument = HydratedDocument<Book>;
export type IBookWihtBorrowCount = BookDocument & { authorNames: string[]; borrowCount: number };

@Schema({ timestamps: true })
export class Book extends MetadataSoftSchema {
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
  ISBN: string;

  @Prop({
    type: [String],
    enum: Category,
    required: true,
    default: [Category.OTHER],
  })
  category: Category[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Author' }],
    required: false,
  })
  authors?: (Types.ObjectId | AuthorDocument)[];

  @Prop({
    type: Number,
    required: true,
  })
  yearOfPublication: number;

  @Prop({
    type: String,
    required: true,
    maxlength: 20,
  })
  version: string;

  @Prop({
    type: String,
    enum: AvailabilityStatus,
    default: AvailabilityStatus.AVAILABLE,
  })
  availabilityStatus: AvailabilityStatus;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'BorrowRecord' }],
    required: false,
  })
  borrowRecord?: (Types.ObjectId | BorrowRecordDocument)[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'ReservationRequest' }],
    required: false,
  })
  reservationRequest?: (Types.ObjectId | ReservationRequestDocument)[];
}

export const BookSchema = SchemaFactory.createForClass(Book);
BookSchema.plugin(SoftDeletePlugin);
