import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Request } from "../../../modules/request/schemas/request.schema";
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
  user_id: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Channel",
    nullable: true,
    index: true,
  })
  channel_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Request",
    nullable: true,
  })
  request_id: Request;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  createdBy: User;

  @Prop({
    type: String,
    nullable: false,
  })
  title: String;

  @Prop({
    type: String,
    nullable: false,
  })
  content: String;

  @Prop({
    type: String,
    nullable: false,
    index: true,
  })
  channel: String;

  @Prop({
    type: String,
    nullable: false,
    index: true,
  })
  type_action: String;

  @Prop({
    type: String,
    nullable: false,
    index: true,
    default: "system",
  })
  notification_type: String;

  @Prop({
    type: String,
    nullable: false,
  })
  param: String;

  @Prop({
    type: String,
    nullable: false,
  })
  click_action: String;

  @Prop({
    type: String,
    nullable: false,
  })
  image: String;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  send_start: MongooseSchema.Types.Date;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
    index: true,
  })
  manual_mode: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
    index: true,
  })
  send_status: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
    index: true,
  })
  read_status: Number;

  @Prop({
    type: String,
    nullable: false,
  })
  router: String;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
