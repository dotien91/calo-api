import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ShortCategory } from "../../../modules/short/schemas/short_category.schema";
import { User } from "../../../modules/user/schemas/user.schema";

export type ShortDocument = Short & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Short {
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
  language: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Media",
  })
  media_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Media",
  })
  ref_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ShortCategory",
  })
  short_category: ShortCategory;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  caption: string;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  like_number: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  view_number: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  comment_number: number;

  @Prop({
    type: Number,
    default: 1,
    nullable: false,
  })
  short_status: number;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "Media",
  })
  music_id: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "Media",
  })
  hashtag_id: MongooseSchema.Types.ObjectId[];
}

export const ShortSchema = SchemaFactory.createForClass(Short);
