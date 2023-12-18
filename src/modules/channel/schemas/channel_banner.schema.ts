import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Channel } from './channel.schema';
import { ChatMedia } from '../../../modules/chat_media/schemas/chat_media.schema';

export type ChannelBannerDocument = ChannelBanner & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class ChannelBanner {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    nullable: false,
    ref: "ChatMedia"
  })
  media_id: ChatMedia;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    nullable: false,
    ref: "User"
  })
  user_id: User;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  banner_url: String;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    nullable: false,
    ref: "Channel"
  })
  channel_id: Channel;

  @Prop({
    type: String,
    default: "homepage",
    nullable: false,
    index: true
  })
  banner_type: String;

}

export const ChannelBannerSchema = SchemaFactory.createForClass(ChannelBanner);
