import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { HandleService } from "./handle_service.schema";
import { Esim } from "../../../modules/e_sim/schemas/esim.schema";
import { User } from "../../../modules/user/schemas/user.schema";
import { Channel } from "../../../modules/channel/schemas/channel.schema";

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
  channel_id: Channel;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Esim", index: true })
  ref_id: Esim;

  @Prop({
    type: String,
    nullable: false,
    default: ""
  })
  handle: String;

  @Prop({
    type: String,
    nullable: false,
    default: ""
  })
  name: String;

  @Prop({
    type: String,
    nullable: false,
    default: ""
  })
  description: String;

  @Prop({
    type: String,
    nullable: false,
    default: ""
  })
  google_store_product_id: String;

  @Prop({
    type: Number,
    nullable: false,
    default: 0
  })
  price: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0
  })
  amount_of_day: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0
  })
  trial_day: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0
  })
  amount_of_coin: Number;

  @Prop({
    type: String,
    nullable: false,
    default: "recurring"
  })
  type: String;

  @Prop({
    type: String,
    nullable: true,
    default: ""
  })
  note: String;

  @Prop({
    type: Number,
    nullable: false,
    default: 1
  })
  status: Number;

  @Prop({
    type: String,
    nullable: false,
    default: ""
  })
  image: String;

  @Prop({
    type: String,
    nullable: false,
    default: "GLOBAL"
  })
  country: String;

  @Prop({
    type: [PlanOptionMetaSchema],
    default: [],
  })
  options: PlanOptionMeta[];

  @Prop({
    type: String,
    nullable: false,
    default: "",
    index: true
  })
  version: String;


}

export const PlanSchema = SchemaFactory.createForClass(Plan);
