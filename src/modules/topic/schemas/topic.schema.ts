import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Plan } from "../../../modules/plan/schemas/plan.schema";
import { User } from "../../../modules/user/schemas/user.schema";

export type TopicDocument = Topic & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Topic {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({
    type: String,
    nullable: false,
  })
  name: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  image: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatRoom",
  })
  chat_room_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  public_album: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: String,
    nullable: false,
  })
  description: string;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  is_official: number;

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
  is_validate: number;

  @Prop({
    type: Number,
    default: 0,
  })
  child_number: number;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  status: string;
}

export const TopicSchema = SchemaFactory.createForClass(Topic).index({
  name: "text",
  description: "text",
});
