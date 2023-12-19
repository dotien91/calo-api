import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "./user.schema";

export type UserLocationHistoryDocument = UserLocationHistory & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class UserLocationHistory {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({
    type: Number,
    default: 0,
    nullable: true,
  })
  speed: number;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  battery: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  low_power_mode: string;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  longitude: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  latitude: number;
}

export const UserLocationHistorySchema = SchemaFactory.createForClass(UserLocationHistory);
