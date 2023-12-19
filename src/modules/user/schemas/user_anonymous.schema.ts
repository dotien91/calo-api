import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

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
  device_id: string;

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
  display_name: string;

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
  user_type: string;

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
    type: Boolean,
    default: false,
    nullable: true,
    index: true,
  })
  is_ab_testing: boolean;

  @Prop({
    type: String,
    default: "",
    nullable: true,
    index: true,
  })
  apple_notification: string;
}

export const UserAnonymousSchema = SchemaFactory.createForClass(UserAnonymous);
