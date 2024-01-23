import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

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
  })
  day: number;
  // 0 - 6 === Sun - Mon

  @Prop({
    type: Number,
  })
  time_start: Date;

  @Prop({
    type: Date,
  })
  time_end: number;
}

export const CourseCalendarSchema = SchemaFactory.createForClass(CourseCalendar);
