import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { AbstractSoftSchema } from './abstract-soft.schema';
import { BookDocument } from './book.schema';
import { RequestStatus } from './enums/request-status.enum';
import { UserDocument } from './user.schema';

export type ReservationRequestDocument = HydratedDocument<ReservationRequest>;
@Schema({ timestamps: true })
export class ReservationRequest extends AbstractSoftSchema {
  @Prop({ type: Types.ObjectId, ref: 'Book' })
  book: Types.ObjectId | BookDocument;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId | UserDocument;

  @Prop({
    type: Date,
    required: true,
    default: Date.now,
  })
  requestDate: Date;

  @Prop({
    type: String,
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  requestStatus: RequestStatus;

  @Prop({
    type: Date,
    required: false,
  })
  active_until: Date;
}

export const ReservationRequestSchema = SchemaFactory.createForClass(ReservationRequest);
