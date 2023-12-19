import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Plan } from "../../../modules/plan/schemas/plan.schema";
import { User } from "../../../modules/user/schemas/user.schema";

@Schema()
export class OptionContent extends Document {
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
  config_type: string;

  @Prop({
    type: String,
  })
  description: string;
}
export const OptionContentSchema = SchemaFactory.createForClass(OptionContent);

export type ConfigDocument = Config & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Config {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  type: String;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  package_name: String;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  count_ab: Number;

  @Prop({
    type: [String],
    default: [],
  })
  data_filter: String[];

  @Prop({
    type: String,
    default: "",
  })
  data_content: String;

  @Prop({
    type: Number,
    default: 0,
  })
  near_by_free: Number;

  @Prop({
    type: Number,
    default: 0,
  })
  chat_free: Number;

  @Prop({
    type: Number,
    default: 0,
  })
  call_free: Number;

  @Prop({
    type: Number,
    default: 0,
  })
  call_pro: Number;

  @Prop({
    type: Number,
    default: 0,
  })
  follow_free: Number;

  @Prop({
    type: Number,
    default: 0,
  })
  view_today_free: Number;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
  })
  filter_free: String[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
  })
  filter_pro: String[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
  })
  filter_premium: String[];

  @Prop({
    type: [OptionContentSchema],
    default: [],
  })
  option_content: OptionContent[];
}

export const ConfigSchema = SchemaFactory.createForClass(Config).index({ package_name: "text" });
