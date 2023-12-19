import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Channel } from "../../../modules/channel/schemas/channel.schema";

export type GiftDocument = Gift & Document;
@Schema()
export class GiftConditions extends Document {
  @Prop({
    type: Number,
  })
  point: number;

  @Prop({
    type: Number,
  })
  level: number;

  @Prop({
    type: Number,
  })
  like: number;

  @Prop({
    type: Number,
  })
  comment: number;

  @Prop({
    type: Number,
  })
  course: number;

  @Prop({
    type: Number,
  })
  birth: number;

  @Prop({
    type: Number,
  })
  coin: number;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  start_time: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  end_time: MongooseSchema.Types.Date;
}
export const GiftConditionsSchema = SchemaFactory.createForClass(GiftConditions);

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Gift {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true, ref: "User" })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true, ref: "Channel" })
  channel_id: Channel | MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    index: true,
    default: "gift",
    nullable: false,
  })
  gift_type: string;

  @Prop({
    type: String,
    default: "",
  })
  name: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  media_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  gift_digital_media: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    default: "",
  })
  gift_digital_url: string;

  @Prop({
    type: String,
    default: "",
  })
  description: string;

  @Prop({
    type: Number,
    default: 0,
  })
  price: number;

  @Prop({
    type: Number,
    default: 10000000,
  })
  stock_qty: number;

  @Prop({
    type: Number,
    default: 0,
  })
  priority: number;

  @Prop({
    type: Number,
    default: 0,
  })
  like_number: number;

  @Prop({
    type: GiftConditionsSchema,
    default: {
      point: 0,
      level: 0,
      like: 0,
      comment: 0,
      course: 0,
      birth: 0,
      coin: 0,
    },
  })
  gift_conditions: GiftConditions;
}

export const GiftSchema = SchemaFactory.createForClass(Gift).index({
  name: "text",
});
