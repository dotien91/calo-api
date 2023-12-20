import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Short } from './short.schema';

export type ShortViewDocument = ShortView & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class ShortView {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Short', index: true })
  video_id: Short;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true
  })
  total_time: Number
}

export const ShortViewSchema = SchemaFactory.createForClass(ShortView);
