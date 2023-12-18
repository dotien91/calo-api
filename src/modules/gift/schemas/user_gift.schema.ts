import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { Gift } from "./gift.schema";
import { Channel } from "../../../modules/channel/schemas/channel.schema";

export type UserGiftDocument = UserGift & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class UserGift {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true, ref: "User" })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true, ref: "Gift" })
  gift_id: Gift;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true, ref: "Channel" })
  channel_id: Channel;

  @Prop({
    type: Number,
    default: 1,
  })
  quantity: Number;

  @Prop({
    type: Number,
    default: 0,
  })
  total_price: Number;

  @Prop({
    type: String,
    index: true,
    default: "prepare",
    nullable: false,
  })
  gift_status: String;
}

export const UserGiftSchema = SchemaFactory.createForClass(UserGift);
