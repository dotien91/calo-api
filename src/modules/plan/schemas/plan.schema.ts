import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { HandleService } from "./handle_service.schema";

export type PlanDocument = Plan & Document;
@Schema()
export class PlanOptionMeta extends Document {
  @Prop({
    type: String,
  })
  key: string;

  @Prop({
    type: String,
  })
  value: string;
}
export const PlanOptionMetaSchema = SchemaFactory.createForClass(PlanOptionMeta);

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Plan {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "HandleService", index: true })
  service_id: HandleService;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Channel", index: true })
  channel_id: String;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Esim", index: true })
  ref_id: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  handle: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  name: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  description: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  google_store_product_id: string;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  price: number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  amount_of_day: number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  trial_day: number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  amount_of_coin: number;

  @Prop({
    type: String,
    nullable: false,
    default: "recurring",
  })
  type: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  note: string;

  @Prop({
    type: Number,
    nullable: false,
    default: 1,
  })
  status: number;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  image: string;

  @Prop({
    type: String,
    nullable: false,
    default: "GLOBAL",
  })
  country: string;

  @Prop({
    type: [PlanOptionMetaSchema],
    default: [],
  })
  options: PlanOptionMeta[];

  @Prop({
    type: String,
    nullable: false,
    default: "",
    index: true,
  })
  version: string;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
