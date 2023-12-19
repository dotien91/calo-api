import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Challenge } from "./challenge.schema";
import { ChatMedia, ChatMediaSchema } from "../../../modules/chat_media/schemas/chat_media.schema";
import { Channel } from "../../../modules/channel/schemas/channel.schema";

export type ChallengeNotificationDocument = ChallengeNotification & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class ChallengeNotification {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Channel", index: true })
  channel_id: Channel;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Challenge", index: true })
  challenge_id: Challenge;
  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  title: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  description: string;

  @Prop({ type: MongooseSchema.Types.Array, ref: "ChatMedia", index: true })
  public_album: ChatMedia[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "ChallengeNotification", index: true })
  parent_id: ChallengeNotification;
}

export const ChallengeNotificationSchema = SchemaFactory.createForClass(ChallengeNotification);
