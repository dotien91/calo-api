import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { Channel } from "../../../modules/channel/schemas/channel.schema";
import { Redeem } from "./redeem.schema";
import { RedeemMission } from "./redeem_mission.schema";

export type RedeemPermissionDocument = RedeemPermission & Document;

@Schema()
export class RedeemPointData extends Document {
  @Prop({
    type: String,
  })
  action_name: String;

  @Prop({
    type: String,
    default: 0
  })
  point_number: String;

  @Prop({
    type: String,
    default: "process"
  })
  status: String;

  @Prop({
    type: String,
  })
  action_point: String;
}
export const RedeemPointDataSchema = SchemaFactory.createForClass(RedeemPointData);

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class RedeemPermission {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Channel", index: true })
  channel_id: Channel;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Redeem", index: true })
  redeem_id: Redeem;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "RedeemMission", index: true })
  redeem_mission_id: RedeemMission;

  @Prop({
    type: [RedeemPointDataSchema],
    default: [],
  })
  point_data: RedeemPointData[];

  @Prop({
    type: String,
    default: "process",
  })
  status: String;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  start_time: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  end_time: MongooseSchema.Types.Date;
}

export const RedeemPermissionSchema = SchemaFactory.createForClass(RedeemPermission);
