import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

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
}

export const RedeemUserSchema = SchemaFactory.createForClass(RedeemUser);
