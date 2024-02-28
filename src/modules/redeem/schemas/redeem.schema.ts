import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type RedeemDocument = Redeem & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Redeem {
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
    type: MongooseSchema.Types.String,
  })
  title: string;

  @Prop({
    type: MongooseSchema.Types.Date,
    default: null,
  })
  start_time: string;

  @Prop({
    type: MongooseSchema.Types.Date,
    default: null,
  })
  end_time: string;

  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  point: number;

  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  coin: number;

  @Prop({
    type: MongooseSchema.Types.Number,
    default: 1,
  })
  required_level: number;
}

export const RedeemSchema = SchemaFactory.createForClass(Redeem);
