import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";

export type ShortCategoryDocument = ShortCategory & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class ShortCategory {
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
  category_language: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  category_content: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  category_excerpt: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  category_slug: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  category_parent: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  category_status: String;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Media",
  })
  category_avatar: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  category_title: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  category_type: String;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  category_view: Number;

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

export const ShortCategorySchema = SchemaFactory.createForClass(ShortCategory).index({
  category_title: "text",
  category_content: "text",
});
