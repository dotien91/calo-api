import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { UserAnonymous } from "../../../modules/user/schemas/user_anonymous.schema";
import { PostCategory } from "./post_category.schema";
import { PostPrompt } from "./post_prompt.schema";

export type PostAnonymousDocument = PostAnonymous & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class PostAnonymous {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserAnonymous", index: true, })
  user_id: UserAnonymous;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "PostPrompt", index: true, })
  prompt_id: PostPrompt

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  question: String

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  answer: String

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  history_count: Number

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  answer_length: Number

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  question_length: Number

}

export const PostAnonymousSchema = SchemaFactory.createForClass(PostAnonymous);
