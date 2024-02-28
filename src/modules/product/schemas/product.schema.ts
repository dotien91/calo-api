import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Media } from "../../media/schemas/media.schema";
import { HandleService } from "../../plan/schemas/handle_service.schema";
import { Plan } from "../../plan/schemas/plan.schema";
import { ProductLabel } from "../interfaces/product.interface";

export type ProductDocument = Product & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Product {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Shop", index: true })
  shop_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  name: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  description: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  long_description: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "HandleService",
  })
  service_id: HandleService;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Plan",
  })
  plan_id: Plan;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Media",
  })
  media_id: Media;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  rating: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  price: number;

  @Prop({
    type: Array,
    enum: [ProductLabel],
    default: [],
  })
  labels: ProductLabel[];

  // percentage
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Coupon",
  })
  coupon_id: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product).index({
  description: "text",
  long_description: "text",
  title: "text",
});
