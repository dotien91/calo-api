import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type UserAnonymousSessionDocument = UserAnonymousSession & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class UserAnonymousSession {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  device_id: String;

  @Prop({
    type: String,
    default: '',
    nullable: true,
  })
  password: String

  @Prop({
    type: String,
    default: '',
    nullable: true,
  })
  user_ip: String

  @Prop({
    type: String,
    default: '',
    nullable: true,
  })
  device_uuid: String

  @Prop({
    type: String,
    default: '',
    nullable: true,
  })
  language: String

  @Prop({
    type: String,
    default: '',
    nullable: true,
  })
  device_type: String

  @Prop({
    type: String,
    default: '',
    nullable: true,
  })
  device_signature: String

  @Prop({
    type: String,
    default: '',
    nullable: true,
    index: true
  })
  apple_signature: String

  @Prop({
    type: String,
    default: '',
    nullable: true,
    index: true
  })
  apple_notification: String

  @Prop({
    type: String,
    default: '',
    nullable: true,
  })
  user_agent: String

  @Prop({
    type: String,
    default: '',
    nullable: true,
  })
  browser_object: String

  @Prop({ type: MongooseSchema.Types.Date, default: Date.now })
  expired_at: MongooseSchema.Types.Date
}

export const UserAnonymousSessionSchema = SchemaFactory.createForClass(UserAnonymousSession);
