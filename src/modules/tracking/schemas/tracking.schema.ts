import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Metric, TrackingType } from "../enums/tracking.enum";

export type TrackingDocument = Tracking & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Tracking {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
    index: true,
  })
  user_id: MongooseSchema.Types.ObjectId;

  /** screen | body (cân nặng, nước) */
  @Prop({
    type: String,
    enum: Object.values(TrackingType),
    index: true,
    nullable: false,
  })
  type: string;

  /** Khi type = body: weight | water | ... */
  @Prop({
    type: String,
    enum: [...Object.values(Metric), null],
    index: true,
    default: null,
  })
  metric: string;

  /** Giá trị track (number hoặc string) */
  @Prop({
    type: MongooseSchema.Types.Mixed,
    default: null,
  })
  value: number | string;

  /** Thời điểm track (client gửi). Không gửi thì dùng createdAt */
  @Prop({
    type: MongooseSchema.Types.Date,
    index: true,
    default: null,
  })
  tracked_at: Date;
}

export const TrackingSchema = SchemaFactory.createForClass(Tracking);
