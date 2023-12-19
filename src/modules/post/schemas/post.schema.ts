import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { PostCategory } from "./post_category.schema";

export type PostDocument = Post & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Post {
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
  post_language: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "PostCategory", index: true })
  post_category: PostCategory;

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
  installation: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  introduction: string;

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
    default: "",
    nullable: false,
  })
  post_parent: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  post_status: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  other_status: string;

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
  public_album: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  downloads: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "User",
  })
  user_entity: MongooseSchema.Types.ObjectId[];

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
  post_information: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  must_do: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  post_additional: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  post_object: string;

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
  post_view: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  total_user: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  money_per_post: number;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  seo_title: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  seo_description: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  seo_keyword: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  social: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  follow: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  career_number: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  min_money: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  max_money: string;
}

export const PostSchema = SchemaFactory.createForClass(Post).index({
  post_title: "text",
  post_content: "text",
});
