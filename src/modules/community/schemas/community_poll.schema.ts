import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Community } from "./community.schema";

export type CommunityPollDocument = CommunityPoll & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class CommunityPoll {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  created_by: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Community", index: true })
  community_id: Community;

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  question: string;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  number_choose: number;

  @Prop({ type: MongooseSchema.Types.Array, ref: "User", index: true, default: [] })
  users_choose: User[];
}

export const CommunityPollSchema = SchemaFactory.createForClass(CommunityPoll);
