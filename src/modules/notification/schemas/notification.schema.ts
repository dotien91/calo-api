import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";

export type NotificationDocument = Notification & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Notification {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: null,
    ref: "User",
    index: true,
  })
  user_id: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  createdBy: User;

  @Prop({
    type: String,
    nullable: false,
  })
  title: string;

  @Prop({
    type: String,
    nullable: false,
  })
  content: string;

  @Prop({
    type: String,
    nullable: false,
    index: true,
  })
  channel: string;

  @Prop({
    type: String,
    nullable: false,
    index: true,
  })
  type_action: string;

  @Prop({
    type: String,
    nullable: false,
    index: true,
    default: "system",
  })
  notification_type: string;

  @Prop({
    type: String,
    nullable: false,
  })
  param: string;

  @Prop({
    type: String,
    nullable: false,
  })
  click_action: string;

  @Prop({
    type: String,
    nullable: false,
  })
  image: string;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  send_start: MongooseSchema.Types.Date;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
    index: true,
  })
  manual_mode: number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
    index: true,
  })
  send_status: number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
    index: true,
  })
  read_status: number;

  @Prop({
    type: String,
    nullable: false,
  })
  router: string;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    default: null,
  })
  replace_pattern: object;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
