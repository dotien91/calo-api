import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import {
  RedeemMissionActionTarget,
  RedeemMissionActionType,
  RedeemMissionStatus,
} from "../interfaces/redeem.interface.i";

export type RedeemMissionDocument = RedeemMission & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class RedeemMission {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
  })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Redeem",
  })
  redeem_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.String,
  })
  title: string;

  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  point: number;

  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  coin: number;

  @Prop({
    type: MongooseSchema.Types.String,
    enum: RedeemMissionActionType,
  })
  action_type: RedeemMissionActionType;

  @Prop({
    type: MongooseSchema.Types.String,
    enum: RedeemMissionActionTarget,
  })
  action_target: RedeemMissionActionTarget;

  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  action_amount: number;

  @Prop({
    type: MongooseSchema.Types.String,
  })
  navigate: string;

  @Prop({
    type: MongooseSchema.Types.String,
    enum: RedeemMissionStatus,
    default: RedeemMissionStatus.PROCESS,
  })
  status: RedeemMissionStatus;
}

export const RedeemMissionSchema = SchemaFactory.createForClass(RedeemMission);
