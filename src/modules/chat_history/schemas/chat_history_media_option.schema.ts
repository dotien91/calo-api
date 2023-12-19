import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type ChatHistoryMediaOptionDocument = ChatHistoryMediaOption & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class ChatHistoryMediaOption {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "ChatMedia",
  })
  chat_media_id: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "ChatHistory",
  })
  chat_history_id: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "ChatRoom",
  })
  chat_room_id: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  createBy: MongooseSchema.Types.ObjectId;
}

export const ChatHistoryMediaOptionSchema = SchemaFactory.createForClass(ChatHistoryMediaOption);
