import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ThreadType } from "../interfaces/thread.interface.i";

export type ThreadDocument = Thread & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Thread {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "courseclasses",
  })
  class_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
  })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.String,
    nullable: false,
  })
  thread_title: string;

  @Prop({
    type: MongooseSchema.Types.String,
    default: "",
    nullable: false,
  })
  thread_content: string;

  @Prop({
    type: MongooseSchema.Types.String,
    nullable: false,
    enum: ThreadType,
  })
  thread_type: ThreadType;

  @Prop({
    type: MongooseSchema.Types.Number,
  })
  max_mark: number;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: "User",
  })
  assigned_user_ids: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    default: [],
    ref: "Media",
  })
  attach_files: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  comment_count: number;

  @Prop({
    type: MongooseSchema.Types.Date,
  })
  expired: string;
}

export const ThreadSchema = SchemaFactory.createForClass(Thread);
