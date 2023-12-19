import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Challenge } from "./challenge.schema";
import { ChallengeGame } from "./challenge_game.schema";

export type ChallengeViewDocument = ChallengeView & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class ChallengeView {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Challenge", index: true })
  challenge_id: Challenge;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "ChallengeModule", index: true })
  game_id: ChallengeGame;
}

export const ChallengeViewSchema = SchemaFactory.createForClass(ChallengeView);
