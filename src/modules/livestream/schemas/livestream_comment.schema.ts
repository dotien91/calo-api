import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Livestream } from "./livestream.schema";

export type LivestreamCommentDocument = LivestreamComment & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class LivestreamComment {
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
    ref: "LivestreamComment",
  })
  parent_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Livestream",
    index: true
  })
  livestream_id: Livestream;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  chat_content: string;

  @Prop({
    type:  MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  media_ids: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: String,
    default: "",
  })
  chat_type: string;

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

export const LivestreamCommentSchema = SchemaFactory.createForClass(LivestreamComment).index({ chat_content: 'text' });
