import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Channel } from './channel.schema';
import { ChannelLevel } from './channel_level.schema';

export type ChannelPermissionDocument = ChannelPermission & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class ChannelPermission {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Channel', index: true })
  channel_id: Channel;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChannelLevel', index: true })
  channel_level: ChannelLevel;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: "user",
    nullable: false,
    index: true
  })
  permission: String[]

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true
  })
  old_point: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true
  })
  point_month: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true
  })
  point_week: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true
  })
  point: Number;

  @Prop({
    type: Number,
    default: 1,
    nullable: false,
    index: true
  })
  level_number: Number;

  @Prop({
    type: String,
    default: "user",
    nullable: false,
    index: true
  })
  channel_role: String

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  coin_number: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  official_status: Number;
}

export const ChannelPermissionSchema = SchemaFactory.createForClass(ChannelPermission);
