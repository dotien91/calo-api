import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Challenge } from "./challenge.schema";

export type ChallengePermissionDocument = ChallengePermission & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class ChallengePermission {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Challenge", index: true })
  challenge_id: Challenge;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  official_status: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  total_point: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true })
  stage_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "ChallengeGame",
  })
  game_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    default: "custom",
    nullable: false,
  })
  game_type: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Channel",
  })
  channel_id: MongooseSchema.Types.ObjectId;
}

export const ChallengePermissionSchema = SchemaFactory.createForClass(ChallengePermission);
