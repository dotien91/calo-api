import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ChatMedia, ChatMediaSchema } from "../../../modules/chat_media/schemas/chat_media.schema";
import { ChatRoom } from "../../../modules/chat_room/schemas/chat_room.schema";
import { TopicPost } from "../../../modules/topic/schemas/topic_post.schema";

export type ChatHistoryDocument = ChatHistory & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class ChatHistory {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
  })
  user_type: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "ChatHistory",
  })
  parent_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "ChatRoom",
    index: true
  })
  chat_room_id: ChatRoom;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    default: null
  })
  topic_post_id: TopicPost;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  chat_content: string;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  media_ids: ChatMedia[];

  @Prop({
    type: String,
    default: "",
  })
  chat_type: string;

  @Prop({
    type: String,
    default: "",
  })
  local_id: string;

  @Prop({
    type: String,
    default: "",
  })
  chat_status: string;

  @Prop({ type: MongooseSchema.Types.Date, default: Date.now })
  send_at: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date })
  read_at: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  createBy: MongooseSchema.Types.ObjectId;
}

export const ChatHistorySchema = SchemaFactory.createForClass(ChatHistory).index({ chat_content: 'text' });
