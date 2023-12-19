import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type UserAnonymousSessionDocument = UserAnonymousSession & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class UserAnonymousSession {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  device_id: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  password: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  user_ip: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  device_uuid: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  language: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  device_type: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  device_signature: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
    index: true,
  })
  apple_signature: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
    index: true,
  })
  apple_notification: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  user_agent: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  browser_object: string;

  @Prop({ type: MongooseSchema.Types.Date, default: Date.now })
  expired_at: MongooseSchema.Types.Date;
}

export const UserAnonymousSessionSchema = SchemaFactory.createForClass(UserAnonymousSession);
