import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "./user.schema";

export type UserAnonymousDocument = UserAnonymous & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class UserAnonymous {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  device_id: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  user_ip: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  display_name: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  device_uuid: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  user_type: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  language: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  device_type: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  device_signature: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
    index: true,
  })
  apple_signature: String;

  @Prop({
    type: Boolean,
    default: false,
    nullable: true,
    index: true,
  })
  is_ab_testing: Boolean;

  @Prop({
    type: String,
    default: "",
    nullable: true,
    index: true,
  })
  apple_notification: String;
}

export const UserAnonymousSchema = SchemaFactory.createForClass(UserAnonymous);
