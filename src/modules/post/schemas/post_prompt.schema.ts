import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { PostCategory } from "./post_category.schema";

export type PostPromptDocument = PostPrompt & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class PostPrompt {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({
    type: String,
    default: "en",
    nullable: false,
    index: true,
  })
  post_language: String;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "PostCategory", index: true })
  post_category: PostCategory;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  text_to_view: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  text_to_ai: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  text_to_image: String;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    nullable: false,
  })
  placeholder: String[];

  @Prop({
    type: String,
    default: "prompt",
    nullable: false,
    index: true,
  })
  post_type: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  post_parent: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  post_status: String;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  post_view: Number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  post_avatar: MongooseSchema.Types.ObjectId;
}

export const PostPromptSchema = SchemaFactory.createForClass(PostPrompt).index({
  text_to_view: "text",
});
