import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
// import { Channel } from "../../../modules/channel/schemas/channel.schema";
// import { Media } from "../../../modules/media/schemas/media.schema";
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

  @Prop({
    type: String,
    nullable: false,
  })
  service_name: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: "HandleService",
  })
  service_id: HandleService;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Media",
  })
  media_id: String;

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
  client_secret: string;

  @Prop({
    type: String,
    nullable: true,
    default: "recurring",
  })
  plan_type: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  coupon_code: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  order_note: string;

  @Prop({
    type: Number,
    default: 1,
  })
  amount_of_package: number;

  @Prop({
    type: Number,
    default: 0,
  })
  price: number;

  @Prop({
    type: Number,
    default: 0,
  })
  coupon_price: number;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  description: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  deep_link: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  product_url: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  payment_method: string;

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
  status: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
    index: true,
  })
  trans_id: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  error_message: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  data_payment: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  redirect_url: string;

  @Prop({
    type: Number,
    default: 0,
    nullable: true,
  })
  trial_days: number;

  @Prop({
    type: Number,
    default: 0,
    auto: true,
  })
  short_id: number;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  vnpay_on: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  billing_on: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  trial_end_on: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  cancelled_on: MongooseSchema.Types.Date;

  // this is use to save transaction info before doing purchased
  @Prop({
    type: Object,
    nullable: false,
  })
  payload: object;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Coupon",
    default: null,
  })
  coupon_product_id: MongooseSchema.Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
