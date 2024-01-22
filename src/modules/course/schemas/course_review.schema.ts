import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Course } from "./course.schema";

export type CourseReviewDocument = CourseReview & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class CourseReview {
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
  })
  review: string;

  @Prop({
    type: Number,
  })
  rating: number;

  @Prop({
    type: Number,
  })
  like_count: number;

  @Prop({
    type: Number,
  })
  dislike_count: number;
}

export const CourseReviewSchema = SchemaFactory.createForClass(CourseReview);
