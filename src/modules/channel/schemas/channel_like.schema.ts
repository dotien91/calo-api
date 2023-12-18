import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Channel } from './channel.schema';

export type ChannelLikeDocument = ChannelLike & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class ChannelLike {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Channel', index: true })
  video_id: Channel;
}

export const ChannelLikeSchema = SchemaFactory.createForClass(ChannelLike);
