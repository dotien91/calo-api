import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Plan } from "../../../modules/plan/schemas/plan.schema";
import { User } from "../../../modules/user/schemas/user.schema";
import { Topic } from "./topic.schema";

export type TopicJoinDocument = TopicJoin & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class TopicJoin {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Topic", index: true })
  topic_id: Topic;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Topic",
  })
  parent_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  is_official: Number;

  @Prop({
    type: Number,
    default: 0,
  })
  child_number: Number;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  status: String;
}

export const TopicJoinSchema = SchemaFactory.createForClass(TopicJoin).index({
  name: "text",
  description: "text",
});
