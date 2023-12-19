import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Plan } from "../../../modules/plan/schemas/plan.schema";
import { User } from "../../../modules/user/schemas/user.schema";

export type TopicPostDocument = TopicPost & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class TopicPost {
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
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  post_avatar: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatRoom",
  })
  chat_room_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Topic",
  })
  topic_id: MongooseSchema.Types.ObjectId;

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
    index: true,
  })
  post_type: String;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  post_view: Number;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  seo_title: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  seo_description: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  seo_keyword: String;
}

export const TopicPostSchema = SchemaFactory.createForClass(TopicPost).index({
  post_title: "text",
  post_content: "text",
});
