import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";

@Schema()
export class SubMenuOption extends Document {
  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  icon_side_bar: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  title_side_bar: string;

  @Prop({
    type: Boolean,
    nullable: false,
    default: false,
  })
  is_show_side_bar: boolean;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  router_link: string;

  @Prop({
    type: Boolean,
    nullable: false,
    default: false,
  })
  is_admin: boolean;
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
  handle: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  title: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  description: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  long_description: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  service_type: string;

  @Prop({
    type: Boolean,
    nullable: false,
    default: true,
  })
  active_status: boolean;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  review_number: number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  review_value: number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  install_number: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Media",
  })
  avatar: string;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "Media",
  })
  public_album: string[];

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
  icon_side_bar: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  title_side_bar: string;

  @Prop({
    type: Boolean,
    nullable: false,
    default: false,
  })
  is_show_side_bar: boolean;

  @Prop({
    type: Boolean,
    nullable: false,
    default: false,
  })
  is_admin: boolean;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  router_link: string;

  @Prop({
    type: [SubMenuOptionSchema],
    nullable: false,
    default: [],
  })
  sub_menu: SubMenuOption;
}

export const HandleServiceSchema = SchemaFactory.createForClass(HandleService);
