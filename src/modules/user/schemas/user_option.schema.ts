import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "./user.schema";
import { UserLocationHistory } from "./user_location_history.schema";
import { UserQuestion } from "./user_question.schema";

export type UserOptionDocument = UserOption & Document;

@Schema()
export class UserOptionMeta extends Document {
  @Prop({
    type: String,
  })
  key: string;

  @Prop({
    type: String,
  })
  value: string;

  @Prop({
    type: String,
  })
  note: string;

  @Prop({
    type: String,
  })
  description: string;
}
export const UserOptionMetaSchema = SchemaFactory.createForClass(UserOptionMeta);

@Schema()
export class UserQuestionMeta extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Question",
  })
  key: UserQuestion;

  @Prop({
    type: String,
  })
  value: string;
}
export const UserQuestionMetaSchema = SchemaFactory.createForClass(UserQuestionMeta);

@Schema()
export class UserActivityReport extends Document {
  @Prop({
    type: String,
  })
  chat_with_match: string;

  @Prop({
    type: String,
  })
  send_first_message: string;

  @Prop({
    type: String,
  })
  replies_within: string;

  @Prop({
    type: String,
  })
  active_within: string;
}
export const UserActivityReportSchema = SchemaFactory.createForClass(UserActivityReport);

@Schema()
export class UserMoodOptionMeta extends Document {
  @Prop({
    type: String,
  })
  image: string;

  @Prop({
    type: String,
  })
  text: string;

  @Prop({ type: MongooseSchema.Types.Date, default: Date.now })
  updateAt: MongooseSchema.Types.Date;
}
export const UserMoodOptionSchema = SchemaFactory.createForClass(UserMoodOptionMeta);

@Schema()
export class UserLocation extends Document {
  @Prop({
    type: String,
  })
  type: string;

  @Prop({
    type: MongooseSchema.Types.Array,
  })
  coordinates: number[];
}
export const UserLocationSchema = SchemaFactory.createForClass(UserLocation);

@Schema()
export class PublicInstagram extends Document {
  @Prop({
    type: String,
  })
  avatar: string;

  @Prop({
    type: String,
  })
  avatar_thumbnail: string;
}
export const PublicInstagramSchema = SchemaFactory.createForClass(PublicInstagram);

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class UserOption {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true, index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "City", default: null, index: true, nullable: true })
  city: String;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "City", default: null, index: true, nullable: true })
  travel_city: String;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "City",
  })
  join_cities: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: String,
    default: "",
  })
  user_address: string;

  @Prop({
    type: String,
    default: "",
  })
  user_birthday: string;

  @Prop({
    type: String,
    default: "",
  })
  user_parent_name: string;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  user_birthday_year: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  longitude: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  latitude: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  base_height: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  base_weight: number;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  base_role: string;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  body_type: string;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  relationship_status: string;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  ethnicity: string;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    index: true,
  })
  language: [string];

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  country: string;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    index: true,
  })
  locking_for: [string];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    index: true,
  })
  where_to_meet: [string];

  @Prop({
    type: String,
    default: "",
  })
  user_job: string;

  @Prop({
    type: String,
    default: "",
  })
  user_department: string;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  user_nation: string;

  @Prop({
    type: [UserOptionMetaSchema],
    default: [],
  })
  social_link: UserOptionMeta[];

  @Prop({
    type: [UserOptionMetaSchema],
    default: [],
  })
  media_link: UserOptionMeta[];

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  user_gender: string;

  @Prop({
    type: Number,
    unsigned: true,
    index: true,
  })
  ready_status: number;

  @Prop({
    type: String,
    default: "",
  })
  user_education: string;

  @Prop({
    type: String,
    default: "",
  })
  user_religion: string;

  @Prop({
    type: String,
    default: "",
  })
  like_alcoholic: string;

  @Prop({
    type: String,
    default: "",
  })
  like_tobacco: string;

  @Prop({
    type: String,
    default: "",
  })
  have_children: string;

  @Prop({
    type: String,
    default: "",
  })
  living_with: string;

  @Prop({
    type: [UserQuestionMetaSchema],
    default: null,
  })
  user_question: UserQuestionMeta[];

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  hiv_status: string;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  last_test: MongooseSchema.Types.Date;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    index: true,
  })
  safety_practices: [string];

  @Prop({ type: MongooseSchema.Types.Date, default: Date.now })
  last_active: MongooseSchema.Types.Date;

  @Prop({
    type: Number,
    unsigned: true,
    index: true,
  })
  user_active: number;

  @Prop({
    type: Number,
    unsigned: true,
    default: 0,
    index: true,
  })
  user_spotlight: number;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  public_album: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [PublicInstagramSchema],
    default: null,
  })
  public_instagram: PublicInstagram[];

  @Prop({
    type: String,
    default: "",
  })
  instagram_token: string;

  @Prop({
    type: String,
    default: "",
  })
  spotify_token: string;

  @Prop({
    type: String,
    default: "",
  })
  sample_message: string;

  @Prop({
    type: String,
    default: "",
  })
  user_spotify: string;

  @Prop({
    type: String,
    default: "",
  })
  public_spotify: string;

  @Prop({
    type: Number,
    unsigned: true,
    default: 1,
    index: true,
  })
  user_status: number;

  @Prop({
    type: "Number",
    default: 0,
  })
  call_count: number;

  @Prop({
    type: Number,
    unsigned: true,
    index: true,
    default: 0,
  })
  sexual_content: number;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  private_album: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "UserInterest",
  })
  user_interest: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: UserLocationSchema,
    default: {
      type: "Point",
      coordinates: [0, 0],
    },
  })
  loc: UserLocation;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  is_avatar: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  circle_point: number;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  avatar_gender: string;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  avatar_point: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  like_point: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  time_point: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  number_sort: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  payment_status: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  disable_account: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  validate_status: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  video_number: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  current_token: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  current_coin: number;

  @Prop({
    type: UserMoodOptionSchema,
    default: null,
  })
  user_mood: UserMoodOptionMeta;

  @Prop({
    type: UserActivityReportSchema,
    default: null,
  })
  activity_report: UserActivityReport;

  @Prop({
    type: String,
    nullable: false,
  })
  bank_name: string;

  @Prop({
    type: String,
    nullable: false,
  })
  bank_number: string;

  @Prop({
    type: String,
    nullable: false,
  })
  bank_account_name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserLocationHistory", index: true, default: null })
  last_user_location: UserLocationHistory;
}

export const UserOptionSchema = SchemaFactory.createForClass(UserOption).index({ loc: "2dsphere" });
