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
  title: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  description: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  long_description: string;

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
  slug: string;

  @Prop({
    type: String,
    default: "en",
    nullable: false,
    index: true,
  })
  language: string;

  @Prop({
    type: String,
    default: "VN",
    nullable: false,
  })
  country: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  version: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  product_id: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  public_status: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  subscribe: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  trash_status: string;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  rating: number;

  @Prop({
    type: Number,
    default: 1,
    nullable: false,
  })
  level_value: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  coin_value: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  video_count: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  post_count: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  join_number: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  news_count: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  doc_count: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  module_count: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  module_child_count: number;

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
