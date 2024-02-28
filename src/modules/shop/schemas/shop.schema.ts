import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type ShopDocument = Shop & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Shop {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    nullable: false,
  })
  name: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Media",
    index: true,
  })
  avatar: string;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  rating: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  sold: number;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "Coupon",
  })
  coupon_ids: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "Media",
  })
  banners: MongooseSchema.Types.ObjectId[];
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
