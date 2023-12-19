import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Order } from "../../../modules/order/schemas/order.schema";
import { User } from "../../../modules/user/schemas/user.schema";

export type PurchaseDocument = Purchase & Document;
@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Purchase {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Order", index: true })
  local_order_id: Order;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  order_id: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  package_name: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  product_id: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  purchase_state: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  purchase_token: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  quantity: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  acknowledged: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  purchase_method: string;

  @Prop({
    type: String,
    nullable: true,
    default: "success",
  })
  validate_status: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  developer_payload: string;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  purchase_time: MongooseSchema.Types.Date;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
