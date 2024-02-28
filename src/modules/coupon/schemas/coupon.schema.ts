import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { makeRandom } from "../../../utils/utils";
import { CouponPaymentMethod, CouponPromotionType, CouponType, CouponVisible } from "../interfaces/coupon.interface.i";

export type CouponDocument = Coupon & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Coupon {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
  })
  title: string;

  @Prop({
    type: String,
  })
  description: string;

  @Prop({
    type: String,
    enum: CouponPaymentMethod,
    default: CouponPaymentMethod.ALL,
  })
  payment_method: CouponPaymentMethod;

  @Prop({
    type: String,
    enum: CouponType,
  })
  type: CouponType;

  @Prop({
    type: Number,
  })
  promotion: number;

  @Prop({
    type: String,
    enum: CouponPromotionType,
  })
  promotion_type: CouponPromotionType;

  @Prop({
    type: Number,
    default: -1, // meaning unlimited
  })
  promotion_max: number;

  @Prop({
    type: Number,
    default: -1, // meaning unlimited
  })
  promotion_min_trigger: number;

  @Prop({
    type: Number,
    default: -1, // meaning unlimited
  })
  total: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true, ref: "Media" })
  media_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true, ref: "User" })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.Date,
    default: null, // meaning no expired
  })
  expired: MongooseSchema.Types.Date;

  @Prop({
    type: MongooseSchema.Types.Date,
    default: null, // meaning no start time
  })
  availableAt: MongooseSchema.Types.Date;

  @Prop({
    type: String,
    enum: CouponVisible,
    default: CouponVisible.PUBLIC,
  })
  visible: CouponVisible;

  @Prop({
    type: String,
    default: makeRandom(6, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
    nullable: false,
    unique: true,
  })
  code: string;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
