import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { HandleService } from "../../../modules/plan/schemas/handle_service.schema";
import { Plan } from "../../../modules/plan/schemas/plan.schema";
import { TransactionRefType } from "../../../modules/transaction/interfaces/transaction.interface";
import { User } from "../../../modules/user/schemas/user.schema";
import { OrderStatus, PayloadType } from "../interfaces/order.interface";

export type OrderDocument = Order & Document;

export class OrderItem {
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
    index: true,
    ref: "Plan",
  })
  plan_id: Plan;

  @Prop({
    type: String,
    nullable: true,
    default: "recurring",
  })
  plan_type: string;

  // this is use to save transaction info before doing purchased
  @Prop({
    type: Object,
    nullable: false,
  })
  payload: {
    type?: PayloadType;
    data?: any;
  };

  @Prop({
    type: String,
    nullable: false,
    enum: TransactionRefType,
  })
  type: TransactionRefType;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  product_url: string;

  @Prop({
    type: Number,
    nullable: false,
  })
  amount_of_package: number;
}

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
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Media",
  })
  media_id: string;

  @Prop({
    type: String,
    index: true,
  })
  client_secret: string;

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
  payment_method: string;

  @Prop({
    type: String,
    default: "pending",
    index: true,
    enum: OrderStatus,
  })
  status: OrderStatus;

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

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Coupon",
    default: null,
  })
  coupon_product_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
  })
  items: Array<OrderItem>;

  @Prop({
    type: String,
    default: "",
  })
  address: string;

  @Prop({
    type: String,
    nullable: false,
  })
  invitation_code: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
