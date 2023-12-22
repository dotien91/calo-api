import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { ChatRoom } from "./chat_room.schema";

export type ChatRoomUserOptionDocument = ChatRoomUserOption & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class ChatRoomUserOption {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "ChatRoom", index: true })
  chat_room_id: ChatRoom;

  @Prop({
    type: "String",
    default: "user",
  })
  user_role: string;

  @Prop({
    type: "String",
    default: "write",
  })
  user_permission: string;

  @Prop({
    type: "String",
    default: "",
  })
  room_title: string;

  @Prop({
    type: "String",
    default: "personal",
    index: true,
  })
  room_type: string;

  @Prop({
    type: "String",
    default: "",
  })
  room_image: string;

  @Prop({
    type: "String",
    default: "",
  })
  query_from: string;

  @Prop({
    type: "Number",
    default: 0,
  })
  read_count: number;

  @Prop({
    type: "Number",
    default: 0,
  })
  call_count: number;

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
  mute_status: number;

  @Prop({
    type: "Number",
    unsigned: true,
    default: 0,
  })
  is_reply: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatRoom",
  })
  last_view: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true, nullable: true })
  partner_id: User;

  @Prop({ type: String, ref: "User", default: "" })
  user_block: string;

  @Prop({ type: MongooseSchema.Types.Date, default: Date.now, index: true })
  last_updated: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", nullable: true, index: true })
  ref_user: MongooseSchema.Types.ObjectId;
}

export const ChatRoomUserOptionSchema = SchemaFactory.createForClass(ChatRoomUserOption);
