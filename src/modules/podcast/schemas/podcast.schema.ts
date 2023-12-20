import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { PodcastCategory } from "./podcast-category.schema";

export type PodcastDocument = Podcast & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Podcast {
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
  podcast_language: String;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "PodcastCategory", index: true })
  podcast_category: PodcastCategory;

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
  content: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  excerpt: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  podcast_slug: String;

  @Prop({
    type: String,
    default: "US",
    nullable: false,
    index: true,
  })
  country: String;

  @Prop({
    type: String,
    default: "open",
    nullable: false,
  })
  podcast_status: String;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Media",
  })
  post_avatar: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "Media",
  })
  attach_files: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  podcast_type: String;

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
  comment_number: Number;
}

export const PodcastSchema = SchemaFactory.createForClass(Podcast).index({
  title: "text",
  content: "text",
});
