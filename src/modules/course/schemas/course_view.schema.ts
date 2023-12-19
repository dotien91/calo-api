import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Course } from "./course.schema";
import { CourseModule } from "./course_module.schema";

export type CourseViewDocument = CourseView & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class CourseView {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Course", index: true })
  course_id: Course;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "CourseModule", index: true })
  module_id: CourseModule;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  total_time: number;
}

export const CourseViewSchema = SchemaFactory.createForClass(CourseView);
