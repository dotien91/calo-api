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
  long_description: String;

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
  slug: String;

  @Prop({
    type: String,
    default: "en",
    nullable: false,
    index: true,
  })
  language: String;

  @Prop({
    type: String,
    default: "VN",
    nullable: false,
  })
  country: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  version: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  public_status: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  subscribe: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  trash_status: String;

  @Prop({
    type: Number,
    default: 1,
    nullable: false,
  })
  level_value: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  coin_value: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  join_number: Number;

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
  member_count: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  max_user: Number;

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
  create_next_cycle: Boolean;

  @Prop({
    type: Boolean,
    default: false,
    nullable: false,
  })
  add_all_user: Boolean;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge).index({
  description: "text",
  long_description: "text",
  title: "text",
});
