import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ChatHistory } from "../../../modules/chat_history/schemas/chat_history.schema";
import { Media } from "../../../modules/media/schemas/media.schema";
import { User } from "../../../modules/user/schemas/user.schema";

export type ChatRoomDocument = ChatRoom & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class ChatRoom {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: "String",
    default: "personal",
  })
  room_type: string;

  @Prop({
    type: "String",
    default: "",
  })
  room_name: string;

  @Prop({
    type: "String",
    default: "",
  })
  room_thumb: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Media",
  })
  room_image: Media;

  @Prop({
    type: "String",
    default: "",
  })
  room_description: string;

  @Prop({
    type: "Number",
    unsigned: true,
    default: 10000,
  })
  room_limit_number: number;

  @Prop({
    type: "Number",
    unsigned: true,
    index: true,
    default: 1,
  })
  room_private: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
  })
  order_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Date })
  start_time: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date })
  end_time: MongooseSchema.Types.Date;

  @Prop({
    type: "String",
    default: "",
  })
  last_message: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatHistory",
  })
  first_history: ChatHistory;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
  })
  last_history: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
  })
  report_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: "Number",
    unsigned: true,
    default: 0,
    index: true,
  })
  chat_history_count: number;

  @Prop({
    type: "Number",
    unsigned: true,
    default: 0,
  })
  is_count: number;

  @Prop({ type: MongooseSchema.Types.Array, ref: "User", index: true })
  group_partners: User[];

  @Prop({
    type: "Number",
    unsigned: true,
    default: 0,
    index: true,
  })
  partner_count: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  user_id: MongooseSchema.Types.ObjectId;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
