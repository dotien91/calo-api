import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ChatMedia, ChatMediaSchema } from "../../../modules/chat_media/schemas/chat_media.schema";
import { HandleService, HandleServiceSchema } from "../../../modules/plan/schemas/handle_service.schema";
import { Plan } from "../../../modules/plan/schemas/plan.schema";
import { PostCategory } from "../../../modules/post/schemas/post_category.schema";
import { User, UserSchema } from "../../../modules/user/schemas/user.schema";

export type ChannelDocument = Channel & Document;

@Schema()
export class ChannelPointData extends Document {
  @Prop({
    type: String,
  })
  key: string;

  @Prop({
    type: String,
  })
  value: string;
}
export const ChannelPointDataSchema = SchemaFactory.createForClass(ChannelPointData);

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Channel {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  attach_files: ChatMedia[];

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  public_status: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  name: String;

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
  sub_domain: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  ios_link: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  android_link: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  domain: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  short_description: String;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  official_status: Number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  avatar: ChatMedia;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  cover: ChatMedia;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "User",
  })
  admin_user: User[];

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  member_number: Number;

  @Prop({
    type: [ChannelPointDataSchema],
    default: [],
  })
  point_data: ChannelPointData[];

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  admin_number: Number;

  @Prop({
    type: Number,
    unsigned: true,
    index: true,
    default: 0,
  })
  channel_version: number;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  note: String;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  hashtag_id: ChatMedia[];

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  mentor_name: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  mentor_phone: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  mentor_address: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  mentor_income: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  redirect_url: String;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  mentor_number_member: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  user_commission: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  mentor_commission: Number;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  mentor_category: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  mentor_target: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  bank_name: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  bank_brand_name: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  bank_account_name: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  data_config: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  bank_account_number: String;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
  })
  payment_method: String[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "HandleService"
  })
  service_id: HandleService[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  bank_qr_code: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.String,
    default: null,
  })
  domain_id: MongooseSchema.Types.String

  @Prop({
    type: MongooseSchema.Types.Array,
    default: null,
  })
  name_servers: MongooseSchema.Types.Array

  @Prop({
    type: MongooseSchema.Types.Boolean,
    default: false,
  })
  need_approval: MongooseSchema.Types.Boolean
}

export const ChannelSchema = SchemaFactory.createForClass(Channel).index({
  name: "text",
  description: "text",
  domain: "text",
  short_description: "text",
});
