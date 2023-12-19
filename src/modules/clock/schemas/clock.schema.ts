import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { UserAnonymous } from "../../../modules/user/schemas/user_anonymous.schema";
import { ClockHistory } from "./clock_history.schema";

export type ClockDocument = Clock & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Clock {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    nullable: false,
    index: true,
  })
  device_id: UserAnonymous;

  @Prop({
    type: String,
    nullable: false,
  })
  clock_type: string;

  @Prop({
    type: String,
    nullable: false,
    index: true,
    default: "enable",
  })
  status: string;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  last_wake_time: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  wake_time: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "ClockHistory", index: true })
  last_clock_history: ClockHistory;
}

export const ClockSchema = SchemaFactory.createForClass(Clock).index({
  name: "text",
  description: "text",
});
