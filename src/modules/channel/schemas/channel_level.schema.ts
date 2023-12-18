import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Channel } from './channel.schema';
import { ChatMedia } from '../../../modules/chat_media/schemas/chat_media.schema';

export type ChannelLevelDocument = ChannelLevel & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class ChannelLevel {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  user_id: User;

  @Prop({
    type: Number,
    default: 1,
    nullable: false,
  })
  level_number: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  total_member: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  level_point: Number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Channel', index: true })
  channel_id: Channel;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  title: String;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChatMedia', index: true })
  media_id: ChatMedia

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChatMedia', index: true })
  course_id: ChatMedia

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChannelLevel', index: true })
  parent_id: ChannelLevel
}

export const ChannelLevelSchema = SchemaFactory.createForClass(ChannelLevel);
