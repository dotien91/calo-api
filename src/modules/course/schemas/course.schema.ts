import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Media } from "../../../modules/media/schemas/media.schema";
import { HandleService } from "../../../modules/plan/schemas/handle_service.schema";
import { Plan } from "../../../modules/plan/schemas/plan.schema";
import { User } from "../../../modules/user/schemas/user.schema";
import { CourseLabel, CourseLevel, CoursePublicStatus, CourseSkill, CourseType } from "../interfaces/course.interface";

export type CourseDocument = Course & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Course {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  title: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  description: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  long_description: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Media",
  })
  avatar: Media;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "HandleService",
  })
  service_id: HandleService;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Plan",
  })
  plan_id: Plan;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Media",
  })
  media_id: Media;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  start_time: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  end_time: MongooseSchema.Types.Date;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  slug: string;

  @Prop({
    type: String,
    default: "en",
    nullable: false,
    index: true,
  })
  language: string;

  @Prop({
    type: String,
    default: "VN",
    nullable: false,
  })
  country: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  version: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  product_id: string;

  @Prop({
    type: String,
    enum: [CoursePublicStatus],
  })
  public_status: string;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  rating: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  price: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  join_number: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  video_count: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  news_count: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  doc_count: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  review_count: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  module_count: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  module_child_count: number;

  @Prop({
    type: Array,
    enum: [CourseLabel],
    default: [],
  })
  labels: CourseLabel[];

  @Prop({
    type: String,
    enum: [CourseLevel],
  })
  level: CourseLevel;

  @Prop({
    type: Array,
    enum: [CourseSkill],
    default: [],
  })
  skills: CourseSkill[];

  @Prop({
    type: String,
    enum: CourseType,
  })
  type: CourseType;

  // percentage
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Coupon",
  })
  coupon_id: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "UserOrganization",
  })
  organization_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.String,
  })
  price_id: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course).index({
  description: "text",
  long_description: "text",
  title: "text",
});
