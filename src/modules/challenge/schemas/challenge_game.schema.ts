import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Challenge } from "./challenge.schema";
import { ChatMedia } from "../../../modules/chat_media/schemas/chat_media.schema";
import { Channel } from "../../../modules/channel/schemas/channel.schema";

export type ChallengeGameDocument = ChallengeGame & Document;

@Schema()
export class GameActivity extends Document {
  @Prop({
    type: String,
  })
  name: string;

  @Prop({
    type: String,
  })
  description: string;

  @Prop({
    type: Number,
  })
  point_tracking: number;

  @Prop({
    type: String,
  })
  module_tracking: string;
}

export const GameActivitySchema = SchemaFactory.createForClass(GameActivity);

@Schema()
export class GameCustomField extends Document {
  @Prop({
    type: String,
  })
  name: string;

  @Prop({
    type: String,
  })
  field_type: string;

  @Prop({
    type: Number,
  })
  default_value: number;

  @Prop({
    type: String,
  })
  max_value: string;

  @Prop({
    type: String,
  })
  min_value: string;
}

export const GameCustomFieldSchema = SchemaFactory.createForClass(GameCustomField);
@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class ChallengeGame {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Channel", index: true })
  channel_id: Channel;

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

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  game_type: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "ChatMedia", index: true })
  media_id: ChatMedia;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "ChallengeGame", index: true })
  parent_id: ChallengeGame;

  @Prop({
    type: [GameCustomFieldSchema],
    default: [],
  })
  custom_field: GameCustomField[];

  @Prop({
    type: [GameActivitySchema],
    default: [],
  })
  game_activity: GameActivity[];
}

export const ChallengeGameSchema = SchemaFactory.createForClass(ChallengeGame);
