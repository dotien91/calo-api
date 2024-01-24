import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { CourseClassType } from "../interfaces/course.interface";

export type CourseCalendarDocument = CourseCalendar & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class CourseCalendar {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: Number,
  })
  time_duration: number;

  @Prop({
    type: Number,
    nullable: false,
  })
  day: number;
  // 0 - 6 === Sun - Mon

  @Prop({
    type: String,
  })
  time_start: string;

  @Prop({
    type: String,
  })
  time_end: string;

  @Prop({
    type: String,
    nullable: false,
    enum: CourseClassType,
  })
  course_type: CourseClassType;
}

export const CourseCalendarSchema = SchemaFactory.createForClass(CourseCalendar);
