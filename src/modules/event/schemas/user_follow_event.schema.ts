import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../../modules/user/schemas/user.schema';
import { Event } from './event.schema';

export type UserFollowEventDocument = UserFollowEvent & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class UserFollowEvent {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', index: true })
  event_id: Event;
}

export const UserFollowEventSchema = SchemaFactory.createForClass(UserFollowEvent);
