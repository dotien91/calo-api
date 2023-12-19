import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ChatMedia } from "../../../modules/chat_media/schemas/chat_media.schema";
import { User } from "../../../modules/user/schemas/user.schema";

@Schema()
export class SubMenuOption extends Document {
  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  icon_side_bar: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  title_side_bar: String;

  @Prop({
    type: Boolean,
    nullable: false,
    default: false,
  })
  is_show_side_bar: Boolean;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  router_link: String;

  @Prop({
    type: Boolean,
    nullable: false,
    default: false,
  })
  is_admin: Boolean;
}
export const SubMenuOptionSchema = SchemaFactory.createForClass(SubMenuOption);

export type HandleServiceDocument = HandleService & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class HandleService {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  handle: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  title: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  description: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  long_description: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  service_type: String;

  @Prop({
    type: Boolean,
    nullable: false,
    default: true,
  })
  active_status: Boolean;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  review_number: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  review_value: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  install_number: Number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  avatar: ChatMedia;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  public_album: ChatMedia[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
  })
  createBy: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  icon_side_bar: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  title_side_bar: String;

  @Prop({
    type: Boolean,
    nullable: false,
    default: false,
  })
  is_show_side_bar: Boolean;

  @Prop({
    type: Boolean,
    nullable: false,
    default: false,
  })
  is_admin: Boolean;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  router_link: String;

  @Prop({
    type: [SubMenuOptionSchema],
    nullable: false,
    default: [],
  })
  sub_menu: SubMenuOption;
}

export const HandleServiceSchema = SchemaFactory.createForClass(HandleService);
