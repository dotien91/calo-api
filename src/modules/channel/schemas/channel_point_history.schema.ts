import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, ObjectId } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Channel } from "./channel.schema";

export type ChannelPointHistoryDocument = ChannelPointHistory & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class ChannelPointHistory {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true })
  entity_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Channel", index: true })
  channel_id: Channel;

  @Prop({
    type: String,
    default: "request",
    nullable: false,
    index: true,
  })
  entity_type: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  content: string;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  point_number: number;
}

export const ChannelPointHistorySchema = SchemaFactory.createForClass(ChannelPointHistory);
