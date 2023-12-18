import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Plan } from "../../../modules/plan/schemas/plan.schema";
import { User } from "../../../modules/user/schemas/user.schema";
import { Clock } from "./clock.schema";

export type ClockHistoryDocument = ClockHistory & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class ClockHistory {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Clock", index: true })
  clock_id: Clock;

  @Prop({
    type: String,
    nullable: false,
    index: true
  })
  device_id: String;

  @Prop({
    type: String,
    default: "",
    nullable: false
  })
  sleep_time: String

  @Prop({
    type: String,
    default: "",
    nullable: false
  })
  wake_time_setup: String

  @Prop({
    type: String,
    default: "",
    nullable: false
  })
  sound: String

  @Prop({
    type: String,
    default: "",
    nullable: false
  })
  temperature: String

  @Prop({
    type: String,
    default: "",
    nullable: false
  })
  oxy_ratio: String

  @Prop({
    type: String,
    default: "",
    nullable: false
  })
  wake_time: String

  @Prop({
    type: String,
    default: "",
    nullable: false
  })
  brightness: String

  @Prop({
    type: String,
    default: "",
    nullable: false
  })
  air_pressure: String

  @Prop({
    type: String,
    default: "",
    nullable: false
  })
  breathing: String

  @Prop({
    type: String,
    default: "",
    nullable: false
  })
  heartbeat: String

  @Prop({
    type: String,
    default: "",
    nullable: false
  })
  magnetic: String

  @Prop({
    type: String,
    default: "",
    nullable: false
  })
  note: String
}

export const ClockHistorySchema = SchemaFactory.createForClass(ClockHistory);
