import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ShareLinkObject } from "../interfaces/redeem.interface.i";

export type RedeemUserDocument = RedeemUser & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class RedeemUser {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
  })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Redeem",
  })
  redeem_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "RedeemMission",
  })
  done_redeem_mission_ids: MongooseSchema.Types.ObjectId[];

  // like
  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  like_community_counter: number;

  // post
  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  post_community_counter: number;

  // comment
  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  comment_community_counter: number;

  // buy
  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  buy_course_counter: number;

  // complete
  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  complete_course_counter: number;

  // join
  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  join_oneone_counter: number;
  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  join_class_counter: number;

  // watch
  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  watch_course_counter: number;

  // referral
  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  referral_account_counter: number;
  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  referral_course_counter: number;

  // share
  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  share_tiktok_counter: number;
  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  share_instagram_counter: number;
  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  share_telegram_counter: number;
  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  share_twitter_counter: number;
  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  share_facebook_counter: number;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
  })
  share_link_container: Array<ShareLinkObject>;
}

export const RedeemUserSchema = SchemaFactory.createForClass(RedeemUser);
