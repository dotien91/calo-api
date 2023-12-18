import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { City } from "../../../modules/city/schemas/city.schema";
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
  type: String;

  @Prop({
    type: MongooseSchema.Types.Array,
  })
  coordinates: Number[];
}
export const UserLocationSchema = SchemaFactory.createForClass(UserLocation);

@Schema()
export class PublicInstagram extends Document {
  @Prop({
    type: String,
  })
  avatar: String;

  @Prop({
    type: String,
  })
  avatar_thumbnail: String;
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
  city: City;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "City", default: null, index: true, nullable: true })
  travel_city: City;

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
  user_address: String;

  @Prop({
    type: String,
    default: "",
  })
  user_birthday: String;

  @Prop({
    type: String,
    default: "",
  })
  user_parent_name: String;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  user_birthday_year: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  longitude: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  latitude: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  base_height: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  base_weight: Number;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  base_role: String;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  body_type: String;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  relationship_status: String;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  ethnicity: String;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    index: true,
  })
  language: [String];

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  country: String;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    index: true,
  })
  locking_for: [String];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    index: true,
  })
  where_to_meet: [String];

  @Prop({
    type: String,
    default: "",
  })
  user_job: String;

  @Prop({
    type: String,
    default: "",
  })
  user_department: String;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  user_nation: String;

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
  user_gender: String;

  @Prop({
    type: Number,
    unsigned: true,
    index: true,
  })
  ready_status: Number;

  @Prop({
    type: String,
    default: "",
  })
  user_education: String;

  @Prop({
    type: String,
    default: "",
  })
  user_religion: String;

  @Prop({
    type: String,
    default: "",
  })
  like_alcoholic: String;

  @Prop({
    type: String,
    default: "",
  })
  like_tobacco: String;

  @Prop({
    type: String,
    default: "",
  })
  have_children: String;

  @Prop({
    type: String,
    default: "",
  })
  living_with: String;

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
  hiv_status: String;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  last_test: MongooseSchema.Types.Date;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    index: true,
  })
  safety_practices: [String];

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
  is_avatar: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  circle_point: Number;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  avatar_gender: String;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  avatar_point: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  like_point: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  time_point: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  number_sort: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  payment_status: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  disable_account: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  validate_status: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  video_number: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  current_token: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  current_coin: Number;

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
  bank_name: String;

  @Prop({
    type: String,
    nullable: false,
  })
  bank_number: String;

  @Prop({
    type: String,
    nullable: false,
  })
  bank_account_name: String;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserLocationHistory", index: true, default: null })
  last_user_location: UserLocationHistory;
}

export const UserOptionSchema = SchemaFactory.createForClass(UserOption).index({ loc: "2dsphere" });
