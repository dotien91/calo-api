import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { PayloadType } from "../../order/interfaces/order.interface";
import { ProductType } from "../../product/interfaces/product.interface";

export type CartDocument = Cart & Document;

export class ProductItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
    ref: "Product",
  })
  product_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: ProductType,
  })
  product_type: string;

  @Prop({
    type: Number,
  })
  amount: number;

  @Prop({
    type: Object,
    nullable: false,
  })
  payload: {
    type?: PayloadType;
    data?: any;
  };
}

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Cart {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
    auto: true,
  })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
  })
  items: Array<ProductItem>;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
