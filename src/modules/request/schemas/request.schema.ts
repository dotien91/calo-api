import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { RequestCategory } from "./request-category.schema";
import { PostPrompt } from "../../../modules/post/schemas/post_prompt.schema";
import { RequestPoll } from "./request_poll.schema";
import { Channel } from "../../../modules/channel/schemas/channel.schema";

export type RequestDocument = Request & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Request {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Channel", index: true })
  channel_id: Channel;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    index: true
  })
  ref_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    default: "en",
    nullable: false,
    index: true,
  })
  post_language: String;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "RequestCategory", index: true })
  post_category: RequestCategory;

  @Prop({ type: MongooseSchema.Types.Array, ref: "RequestPoll", index: true, default: [] })
  poll_ids: RequestPoll[];

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  post_title: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  post_content: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  post_excerpt: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  post_slug: String;

  @Prop({
    type: String,
    default: "US",
    nullable: false,
    index: true,
  })
  country: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  post_status: String;

  @Prop({
    type: String,
    default: "{}",
    nullable: false,
  })
  data_json: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  data_json_type: String;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  post_avatar: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  attach_files: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    nullable: false,
    ref: "PostPrompt",
  })
  post_information: PostPrompt;

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  post_type: String;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  view_number: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  like_number: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  share_number: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  is_pin: Number;

  @Prop({
    type: Number,
    default: 1,
    nullable: false,
    index: true,
  })
  is_comment: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  dislike_number: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  comment_number: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  vote_number: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  trending_number: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  popular_number: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  points: Number;
}

export const RequestSchema = SchemaFactory.createForClass(Request).index({
  post_title: "text",
  post_content: "text",
});
