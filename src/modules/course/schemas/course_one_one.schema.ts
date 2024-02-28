import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { CourseOneOneRole } from "../interfaces/course.interface";

export type CourseOneOneDocument = CourseOneOne & Document;

// this schema use to store teacher time available in 1-1 room
@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class CourseOneOne {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Course", index: true })
  course_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: CourseOneOneRole,
  })
  role: CourseOneOneRole;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "CourseCalendar",
  })
  time_available: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "CourseCalendar",
  })
  time_pick: MongooseSchema.Types.ObjectId[];
}

export const CourseOneOneSchema = SchemaFactory.createForClass(CourseOneOne);
