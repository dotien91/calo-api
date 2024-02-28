import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Livestream } from "./livestream.schema";

export type LivestreamLikeDocument = LivestreamLike & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class LivestreamLike {
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
    type: String,
    default: "",
    nullable: false,
  })
  react_type: string;
}

export const LivestreamLikeSchema = SchemaFactory.createForClass(LivestreamLike);
