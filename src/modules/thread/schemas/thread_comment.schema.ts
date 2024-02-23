import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ThreadCommentType } from "../interfaces/thread.interface.i";

export type ThreadCommentDocument = ThreadComment & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class ThreadComment {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Thread",
  })
  thread_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
  })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.String,
    default: "",
    nullable: false,
  })
  content: string;

  @Prop({
    type: MongooseSchema.Types.String,
    nullable: false,
    enum: ThreadCommentType,
  })
  type: ThreadCommentType;

  // should available when type = ThreadCommentType.FILE
  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    default: [],
    ref: "Media",
  })
  attach_files: MongooseSchema.Types.ObjectId[];

  // should available when type = ThreadCommentType.PRIVATE
  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
    nullable: false,
    min: 0,
    max: 10,
  })
  mark: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
  })
  reply_to_user_id: MongooseSchema.Types.ObjectId;
}

export const ThreadCommentSchema = SchemaFactory.createForClass(ThreadComment);

