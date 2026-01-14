import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { UserRoles } from "../interfaces/user.interface";

export type UserDocument = User & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class User {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    index: true,
  })
  user_login: string;

  @Prop({
    type: String,
    required: true,
    index: true,
  })
  user_email: string;

  @Prop({
    type: String,
    default: "",
  })
  user_address?: string;

  @Prop({
    type: Array,
    default: [],
  })
  user_payment_address?: string[];

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  user_avatar: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  user_avatar_thumbnail: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  public_sound: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  user_cover: string;

  @Prop({
    type: String,
  })
  user_password: string;

  @Prop({
    type: String,
  })
  display_name: string;

  @Prop({
    type: String,
    default: UserRoles.USER,
    enum: UserRoles,
  })
  user_role: UserRoles;

  @Prop({
    type: Number,
    unsigned: true,
    index: true,
  })
  user_active: number;

  @Prop({
    type: String,
    default: "",
  })
  bio: string;

  @Prop({
    type: String,
    default: "",
  })
  description: string;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  country: string;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  verify_code: string;

  @Prop({ type: MongooseSchema.Types.Date, default: Date.now, index: true })
  last_active: MongooseSchema.Types.Date;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "User",
  })
  block_users: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "User",
  })
  follow_users: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "User",
  })
  disagree_users: User[];

  @Prop({
    type: Number,
    unsigned: true,
    index: true,
  })
  user_status: number;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  phone_number: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  phone_session: string;

  @Prop({
    type: Boolean,
    default: false,
    nullable: true,
  })
  is_validated_phone: boolean;

  @Prop({
    type: Boolean,
    default: false,
    nullable: false,
  })
  official_status: boolean;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    nullable: false,
  })
  links: Array<Object>;

  @Prop({
    type: Boolean,
    default: false,
  })
  is_native: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  is_verified: boolean;

  @Prop({
    type: Array,
    default: [],
  })
  certificates: Array<Object>;

  @Prop({
    type: Array,
    default: [],
  })
  educations: Array<Object>;

  @Prop({
    type: Number,
  })
  tutor_level: number;

  @Prop({
    type: String,
  })
  badge: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "UserOrganization",
  })
  organization_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: Number,
    default: 0,
  })
  rating: number;

  @Prop({
    type: String,
    default: "",
  })
  timezone: string;

  @Prop({
    type: String,
    default: "",
  })
  default_language: string;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "User",
  })
  ignore_followers: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: Number,
    default: 0,
  })
  point: number;

  @Prop({
    type: Number,
    default: 0,
  })
  point_exchange: number;

  @Prop({
    type: Number,
    default: 1,
  })
  level: number;

  @Prop({
    type: String,
    unique: true,
    nullable: false,
  })
  invitation_code: string;

  @Prop({
    type: String,
  })
  ref_invitation_code: string;

  @Prop({
    type: Number,
    default: 0,
  })
  current_coin: number;

  @Prop({
    type: Number,
    default: 0,
  })
  current_token: number;

  @Prop({
    type: MongooseSchema.Types.Number,
    default: 0,
  })
  taught_time: number;

  @Prop({
    type: MongooseSchema.Types.Boolean,
    default: false,
  })
  is_pending_to_became_teacher: boolean;

  @Prop({
    type: MongooseSchema.Types.Array,
  })
  skills: any[];

  @Prop({
    type: MongooseSchema.Types.String,
  })
  ielts_band: string;

  @Prop({
    type: MongooseSchema.Types.Number,
  })
  exp_time: number;

}

export const UserSchema = SchemaFactory.createForClass(User).index({
  user_login: "text",
  user_email: "text",
  display_name: "text",
  _id: "text",
});
