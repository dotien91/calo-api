import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type MediaDocument = Media & Document;

@Schema()
export class MediaMeta extends Document {
  @Prop({
    type: String,
  })
  key: string;

  @Prop({
    type: String,
  })
  value: string;
}
export const MediaMetaSchema = SchemaFactory.createForClass(MediaMeta);

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Media {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  media_url: string;

  @Prop({
    type: String,
    default: "",
  })
  media_url_presign: string;

  @Prop({
    type: String,
    default: "",
  })
  media_type: string;

  @Prop({
    type: String,
    default: "",
  })
  media_thumbnail: string;

  @Prop({
    type: String,
    default: "",
  })
  media_content: string;

  @Prop({
    type: String,
    default: "",
  })
  media_square: string;

  @Prop({
    type: String,
    default: "",
  })
  media_mime_type: string;

  @Prop({
    type: String,
    default: "",
  })
  media_file_name: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "ChatHistory",
    default: null,
  })
  chat_history_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "ChatRoom",
    default: null,
  })
  chat_room_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: Number,
    unsigned: true,
    default: 0,
  })
  media_status: number;

  @Prop({
    type: String,
    default: "",
  })
  gender: string;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  function_type: string;

  @Prop({
    type: Number,
    unsigned: true,
    default: 0,
  })
  sexual_content: number;

  @Prop({
    type: String,
    default: "",
  })
  data_ai: string;

  @Prop({
    type: [MediaMetaSchema],
    default: [],
  })
  media_meta: MediaMeta[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  createBy: MongooseSchema.Types.ObjectId;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
