import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Channel } from "../../../modules/channel/schemas/channel.schema";
import { ChatMedia, ChatMediaSchema } from "../../../modules/chat_media/schemas/chat_media.schema";
import { HandleService } from "../../../modules/plan/schemas/handle_service.schema";
import { Plan } from "../../../modules/plan/schemas/plan.schema";
import { PostCategory } from "../../../modules/post/schemas/post_category.schema";
import { User } from "../../../modules/user/schemas/user.schema";

export type CourseDocument = Course & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Course {
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
    type: String,
    default: "",
    nullable: false,
  })
  title: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  description: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  long_description: String;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  avatar: ChatMedia;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "HandleService",
  })
  service_id: HandleService;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Plan",
  })
  plan_id: Plan;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  media_id: ChatMedia;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  start_time: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  end_time: MongooseSchema.Types.Date;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  slug: String;

  @Prop({
    type: String,
    default: "en",
    nullable: false,
    index: true,
  })
  language: String;

  @Prop({
    type: String,
    default: "VN",
    nullable: false,
  })
  country: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  version: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  product_id: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  public_status: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  subscribe: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  trash_status: String;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  rating: Number;

  @Prop({
    type: Number,
    default: 1,
    nullable: false,
  })
  level_value: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  coin_value: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  video_count: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  post_count: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  join_number: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  news_count: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  doc_count: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  module_count: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  module_child_count: Number;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  hashtag_id: ChatMedia[];
}

export const CourseSchema = SchemaFactory.createForClass(Course).index({
  description: "text",
  long_description: "text",
  title: "text",
});
