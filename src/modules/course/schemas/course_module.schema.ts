import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Course } from "./course.schema";
import { ChatMedia } from "../../../modules/chat_media/schemas/chat_media.schema";

export type CourseModuleDocument = CourseModule & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class CourseModule {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Course", index: true })
  course_id: Course;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  title: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "ChatMedia", index: true })
  media_id: ChatMedia;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "CourseModule", index: true })
  parent_id: CourseModule;
}

export const CourseModuleSchema = SchemaFactory.createForClass(CourseModule);
