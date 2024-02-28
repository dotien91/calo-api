import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { Course } from "./course.schema";

export type CourseClassDocument = CourseClass & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class CourseClass {
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
    ref: "CourseCalendar",
  })
  course_calendar_ids: MongooseSchema.Types.ObjectId[];

  @Prop({ type: String })
  name: string;

  @Prop({ type: Number })
  limit_member: number;

  @Prop({ type: Date })
  start_time: string;

  @Prop({ type: Date })
  end_time: string;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "User",
  })
  members: MongooseSchema.Types.ObjectId[];
}

export const CourseClassSchema = SchemaFactory.createForClass(CourseClass);
