import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Course } from "./course.schema";

export type CourseCalendarTeacherDocument = CourseCalendarTeacher & Document;

// this schema use to store teacher time available in 1-1 room
@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class CourseCalendarTeacher {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Course", index: true })
  course_id: Course;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "CourseCalendarTeacher",
  })
  time_available: MongooseSchema.Types.ObjectId[];
}

export const CourseCalendarTeacherSchema = SchemaFactory.createForClass(CourseCalendarTeacher);

