import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Challenge } from "./challenge.schema";
import { ChatMedia, ChatMediaSchema } from "../../../modules/chat_media/schemas/chat_media.schema";
import { Channel } from "../../../modules/channel/schemas/channel.schema";

export type ChallengeActivityDocument = ChallengeActivity & Document;

@Schema()
export class ChallengeActivityMeta extends Document {
  @Prop({
    type: String,
  })
  meta_key: string;

  @Prop({
    type: String,
  })
  meta_value: string;

  @Prop({
    type: String,
  })
  meta_type: string;

  @Prop({
    type: String,
  })
  meta_title: string;
}
export const ChallengeActivityMetaSchema = SchemaFactory.createForClass(ChallengeActivityMeta);

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class ChallengeActivity {
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
  title: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  description: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  admin_note: String;

  @Prop({ type: MongooseSchema.Types.Array, ref: "ChatMedia", index: true })
  public_album: ChatMedia[];

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  start_time: MongooseSchema.Types.Date;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  point_value: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  official_status: Number;

  @Prop({
    type: [ChallengeActivityMetaSchema],
    default: null,
  })
  data_activity: ChallengeActivityMeta[];
}

export const ChallengeActivitySchema = SchemaFactory.createForClass(ChallengeActivity);
