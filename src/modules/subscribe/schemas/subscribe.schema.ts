import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Channel } from "../../../modules/channel/schemas/channel.schema";
import { HandleService } from "../../../modules/plan/schemas/handle_service.schema";
import { Plan } from "../../../modules/plan/schemas/plan.schema";
import { User } from "../../../modules/user/schemas/user.schema";

export type SubscribeDocument = Subscribe & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Subscribe {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Channel", index: true })
  channel_id: Channel;

  @Prop({
    type: String,
    nullable: false,
    index: true,
  })
  service_name: String;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    nullable: false,
    ref: "HandleService"
  })
  service_id: HandleService;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    nullable: false,
    ref: "Plan",
    index: true,
  })
  plan_id: Plan;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  coupon_code: String;

  @Prop({
    type: Boolean,
    nullable: true,
    default: true,
  })
  is_auto_renew: Boolean;

  @Prop({
    type: Boolean,
    nullable: true,
    default: false,
  })
  is_trial: Boolean;

  @Prop({
    type: String,
    nullable: true,
    default: "active",
  })
  status: String;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  start_at: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  end_at: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  cancel_at: MongooseSchema.Types.Date;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  manual1: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  manual2: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  phone: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  serial: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  expiryDate: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  qrCodeString: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  dataClient: String;
}

export const SubscribeSchema = SchemaFactory.createForClass(Subscribe);
