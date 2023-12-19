import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { Channel } from "../../../modules/channel/schemas/channel.schema";
import { Gift } from "../../../modules/gift/schemas/gift.schema";
import { RedeemMission, RedeemMissionSchema } from "./redeem_mission.schema";

export type RedeemDocument = Redeem & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Redeem {
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
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "RedeemMission",
  })
  mission_data: MongooseSchema.Types.ObjectId[] | RedeemMission[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "Gift",
  })
  gift_data: Gift[];

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  gift_coin: number;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  redeem_name: string;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  total_day: number;

  @Prop({
    type: String,
    default: "open",
    nullable: false,
  })
  redeem_status: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  post_avatar: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  attach_files: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  join_total: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  redeem_level: number;
}

export const RedeemSchema = SchemaFactory.createForClass(Redeem);
