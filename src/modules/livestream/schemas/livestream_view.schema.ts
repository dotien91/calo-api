import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Livestream } from "./livestream.schema";

export type LivestreamViewDocument = LivestreamView & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class LivestreamView {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Livestream", index: true })
  livestream_id: Livestream;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  total_time: number;
}

export const LivestreamViewSchema = SchemaFactory.createForClass(LivestreamView);
