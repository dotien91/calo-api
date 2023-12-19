import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "./user.schema";

export type UserSessionDocument = UserSession & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class UserSession {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

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

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
  })
  unset_ids: MongooseSchema.Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.Date, default: Date.now })
  expired_at: MongooseSchema.Types.Date;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);
