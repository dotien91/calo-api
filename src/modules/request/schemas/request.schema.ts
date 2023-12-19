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
    index: true,
  })
  ref_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    default: "en",
    nullable: false,
    index: true,
  })
  post_language: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "RequestCategory", index: true })
  post_category: RequestCategory;

  @Prop({ type: MongooseSchema.Types.Array, ref: "RequestPoll", index: true, default: [] })
  poll_ids: RequestPoll[];

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  post_title: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  post_content: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  post_excerpt: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  post_slug: string;

  @Prop({
    type: String,
    default: "US",
    nullable: false,
    index: true,
  })
  country: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  post_status: string;

  @Prop({
    type: String,
    default: "{}",
    nullable: false,
  })
  data_json: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  data_json_type: string;

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
  post_type: string;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  view_number: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  like_number: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  share_number: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  is_pin: number;

  @Prop({
    type: Number,
    default: 1,
    nullable: false,
    index: true,
  })
  is_comment: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  dislike_number: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  comment_number: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  vote_number: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  trending_number: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  popular_number: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  points: number;
}

export const RequestSchema = SchemaFactory.createForClass(Request).index({
  post_title: "text",
  post_content: "text",
});
