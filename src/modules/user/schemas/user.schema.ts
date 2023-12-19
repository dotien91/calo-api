import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Channel } from "diagnostics_channel";
import { Document, Schema as MongooseSchema } from "mongoose";
import { UserLocationHistory } from "./user_location_history.schema";
import { UserOption } from "./user_option.schema";

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
    nullable: true,
  })
  user_avatar: string;

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
  user_avatar_thumbnail: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  user_avatar_square: string;

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
    default: "user",
  })
  user_role: string;

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
  })
  user_referrer: string;

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
  email_token: string;

  @Prop({
    type: Number,
    default: 0,
  })
  user_balance: number;

  @Prop({
    type: Number,
    default: 0,
  })
  user_level: number;

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
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "Event",
  })
  follow_event: Event[];

  @Prop({
    type: Number,
    unsigned: true,
    index: true,
  })
  user_status: number;

  @Prop({
    type: Number,
    unsigned: true,
    index: true,
    default: 0,
  })
  user_version: number;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  user_phone: string;

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
  is_validate_phone: boolean;

  @Prop({
    type: Number,
    unsigned: true,
    default: 0,
  })
  call_count: number;

  @Prop({
    type: Number,
    unsigned: true,
    default: 0,
  })
  chat_count: number;

  @Prop({
    type: Number,
    unsigned: true,
    default: 0,
  })
  map_count: number;

  @Prop({
    type: Number,
    unsigned: true,
    default: 0,
  })
  system_message: number;

  @Prop({
    type: Number,
    unsigned: true,
    default: 1,
  })
  notification_community: number;
  @Prop({
    type: Number,
    unsigned: true,
    default: 1,
  })
  notification_chat: number;
  @Prop({
    type: Number,
    unsigned: true,
    default: 1,
  })
  notification_user: number;
  @Prop({
    type: Number,
    unsigned: true,
    default: 1,
  })
  notification_course: number;

  @Prop({
    type: Number,
    unsigned: true,
    default: 1,
  })
  message_stranger: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserOption" })
  user_option_id: UserOption;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserLocationHistory", index: true, default: null })
  last_user_location: UserLocationHistory;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "Request",
    index: true,
  })
  notification_request: Request[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "Channel",
    index: true,
  })
  channel_permission: Channel[];
}

export const UserSchema = SchemaFactory.createForClass(User).index({
  user_login: "text",
  user_email: "text",
  display_name: "text",
  _id: "text",
});
