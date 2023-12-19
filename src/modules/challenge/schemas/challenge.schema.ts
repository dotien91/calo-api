import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Channel } from "../../../modules/channel/schemas/channel.schema";
import { ChatMedia } from "../../../modules/chat_media/schemas/chat_media.schema";
import { Gift, GiftSchema } from "../../../modules/gift/schemas/gift.schema";
import { Plan } from "../../../modules/plan/schemas/plan.schema";
import { PostCategory } from "../../../modules/post/schemas/post_category.schema";
import { User } from "../../../modules/user/schemas/user.schema";
import { ChallengeGame } from "./challenge_game.schema";

export type ChallengeDocument = Challenge & Document;

@Schema()
export class ChallengeStage extends Document {
  @Prop({
    type: String,
  })
  name: string;

  @Prop({
    type: String,
  })
  description: string;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  start_time: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  end_time: MongooseSchema.Types.Date;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "Gift",
  })
  gift_data: Gift[];
}
export const ChallengeStageSchema = SchemaFactory.createForClass(ChallengeStage);

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Challenge {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Channel", index: true })
  channel_id: Channel;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "ChallengeGame", index: true })
  game_id: ChallengeGame;

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
  long_description: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  avatar: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  media_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  start_time: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  end_time: MongooseSchema.Types.Date;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  slug: string;

  @Prop({
    type: String,
    default: "en",
    nullable: false,
    index: true,
  })
  language: string;

  @Prop({
    type: String,
    default: "VN",
    nullable: false,
  })
  country: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  version: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  public_status: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  subscribe: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  trash_status: string;

  @Prop({
    type: Number,
    default: 1,
    nullable: false,
  })
  level_value: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  coin_value: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  join_number: number;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "Gift",
  })
  gift_data: Gift[];

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  member_count: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  max_user: number;

  @Prop({
    type: [ChallengeStageSchema],
    default: [],
  })
  challenge_stage: ChallengeStage[];

  @Prop({
    type: Boolean,
    default: false,
    nullable: false,
  })
  create_next_cycle: boolean;

  @Prop({
    type: Boolean,
    default: false,
    nullable: false,
  })
  add_all_user: boolean;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge).index({
  description: "text",
  long_description: "text",
  title: "text",
});
