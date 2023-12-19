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
  color: string;

  @Prop({
    type: String,
    default: "",
  })
  name: string;

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
  feature: string[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    index: true,
  })
  white_list: string[];

  @Prop({
    type: String,
    default: "",
  })
  logo: string;

  @Prop({
    type: String,
    default: "",
  })
  video: string;

  @Prop({
    type: OptionContentSchema,
    default: null,
  })
  link: OptionContent;

  @Prop({
    type: String,
    default: "",
  })
  deeplink: string;

  @Prop({
    type: Number,
    default: 0,
  })
  view_count: number;
}

export const EcoSystemSchema = SchemaFactory.createForClass(EcoSystem);
