import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { Channel } from "../../../modules/channel/schemas/channel.schema";
import { Gift } from "../../../modules/gift/schemas/gift.schema";

export type RedeemHistoryDocument = RedeemHistory & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class RedeemHistory {
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
    default: "",
  })
  action_name: String;

  @Prop({
    type: Number,
    default: 0,
  })
  point_value: Number;
}

export const RedeemHistorySchema = SchemaFactory.createForClass(RedeemHistory);
