import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Channel } from "../../../modules/channel/schemas/channel.schema";
import { Gift } from "../../../modules/gift/schemas/gift.schema";
import { User } from "../../../modules/user/schemas/user.schema";
import { Redeem } from "./redeem.schema";

export type RedeemMissionDocument = RedeemMission & Document;

@Schema()
export class MissionAction extends Document {
  @Prop({
    type: String,
  })
  action_name: String;

  @Prop({
    type: String,
  })
  action_point: String;
}
export const MissionActionSchema = SchemaFactory.createForClass(MissionAction);

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class RedeemMission extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Channel", index: true })
  channel_id: Channel;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Redeem", index: true })
  redeem_id: Redeem;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  number_of_day: Number;

  @Prop({
    type: [MissionActionSchema],
    default: [],
  })
  mission_action: MissionAction[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "Gift",
  })
  gift_data: Gift[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
  })
  action_name: String[];

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  gift_coin: Number;
  createdAt: Date;
}
export const RedeemMissionSchema = SchemaFactory.createForClass(RedeemMission);
