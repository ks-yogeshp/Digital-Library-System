import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { AvailabilityStatus } from './enums/availibity-status.enum';
import { Category } from './enums/category.enum';
import { AuthorDocument } from './author.schema';
import { BorrowRecord, BorrowRecordDocument } from './borrow-record.schema';
import { MetadataSoftSchema } from './metadata-soft.schema';
import { ReservationRequest, ReservationRequestDocument } from './reservation-request.schema';

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
  borrowHistory?: (Types.ObjectId | BorrowRecordDocument)[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'ReservationRequest' }],
    required: false,
  })
  reservationHistory?: (Types.ObjectId | ReservationRequestDocument)[];
}

export const BookSchema = SchemaFactory.createForClass(Book);
