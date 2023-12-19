import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Channel } from "../../../modules/channel/schemas/channel.schema";
import { ChatMedia } from "../../../modules/chat_media/schemas/chat_media.schema";
import { HandleService } from "../../../modules/plan/schemas/handle_service.schema";
import { Plan } from "../../../modules/plan/schemas/plan.schema";
import { User } from "../../../modules/user/schemas/user.schema";

export type OrderDocument = Order & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Order {
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
  })
  service_name: String;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: "HandleService",
  })
  service_id: HandleService;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  media_id: ChatMedia;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: "Plan",
  })
  plan_id: Plan;

  @Prop({
    type: String,
    index: true,
  })
  client_secret: String;

  @Prop({
    type: String,
    nullable: true,
    default: "recurring",
  })
  plan_type: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  coupon_code: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  order_note: String;

  @Prop({
    type: Number,
    default: 1,
  })
  amount_of_package: Number;

  @Prop({
    type: Number,
    default: 0,
  })
  price: Number;

  @Prop({
    type: Number,
    default: 0,
  })
  coupon_price: Number;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  description: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  deep_link: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  product_url: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  payment_method: String;

  @Prop({
    type: String,
    default: "pending",
    index: true,
    enum: [
      "pending",
      "processing",
      "fraud",
      "success",
      "close",
      "draft",
      "trial",
      "error",
      "trial_false",
      "done",
      "free",
    ],
  })
  status: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
    index: true,
  })
  trans_id: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  error_message: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  data_payment: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  redirect_url: String;

  @Prop({
    type: Number,
    default: 0,
    nullable: true,
  })
  trial_days: Number;

  @Prop({
    type: Number,
    default: 0,
    auto: true,
  })
  short_id: Number;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  vnpay_on: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  billing_on: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  trial_end_on: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  cancelled_on: MongooseSchema.Types.Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
