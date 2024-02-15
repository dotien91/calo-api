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
  title: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  description: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  long_description: String;

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
  slug: String;

  @Prop({
    type: String,
    default: "en",
    nullable: false,
    index: true,
  })
  language: String;

  @Prop({
    type: String,
    default: "VN",
    nullable: false,
  })
  country: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  version: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  product_id: String;

  @Prop({
    type: String,
    enum: [CoursePublicStatus],
  })
  public_status: String;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  rating: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  price: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  join_number: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  video_count: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  news_count: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  doc_count: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  module_count: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  module_child_count: Number;

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
}

export const CourseSchema = SchemaFactory.createForClass(Course).index({
  description: "text",
  long_description: "text",
  title: "text",
});
