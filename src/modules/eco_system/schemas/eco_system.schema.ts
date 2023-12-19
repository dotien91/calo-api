import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Plan } from "../../../modules/plan/schemas/plan.schema";
import { User } from "../../../modules/user/schemas/user.schema";

@Schema()
export class OptionContent extends Document {
  @Prop({
    type: String,
  })
  android: string;

  @Prop({
    type: String,
  })
  ios: string;

  @Prop({
    type: String,
  })
  website: string;
}
export const OptionContentSchema = SchemaFactory.createForClass(OptionContent);

export type EcoSystemDocument = EcoSystem & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class EcoSystem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    default: "",
  })
  color: String;

  @Prop({
    type: String,
    default: "",
  })
  name: String;

  @Prop({
    type: Object,
    default: {},
  })
  des: Object;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  public_album: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
  })
  feature: String[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    index: true,
  })
  white_list: String[];

  @Prop({
    type: String,
    default: "",
  })
  logo: String;

  @Prop({
    type: String,
    default: "",
  })
  video: String;

  @Prop({
    type: OptionContentSchema,
    default: null,
  })
  link: OptionContent;

  @Prop({
    type: String,
    default: "",
  })
  deeplink: String;

  @Prop({
    type: Number,
    default: 0,
  })
  view_count: Number;
}

export const EcoSystemSchema = SchemaFactory.createForClass(EcoSystem);
