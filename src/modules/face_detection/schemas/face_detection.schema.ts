import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ChatMedia } from "../../../modules/chat_media/schemas/chat_media.schema";
import { User } from "../../../modules/user/schemas/user.schema";

export type FaceDetectionDocument = FaceDetection & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class FaceDetection {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "ChatMedia", index: true })
  id_avatar: ChatMedia;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "ChatMedia", index: true })
  id_compare: ChatMedia;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  media_ids: MongooseSchema.Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  point: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  validate_status: Number;

  @Prop({
    type: String,
    nullable: false,
  })
  response: String;
}

export const FaceDetectionSchema = SchemaFactory.createForClass(FaceDetection);
