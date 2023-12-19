import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

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
  type: string;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  package_name: string;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  count_ab: number;

  @Prop({
    type: [String],
    default: [],
  })
  data_filter: string[];

  @Prop({
    type: String,
    default: "",
  })
  data_content: string;

  @Prop({
    type: [OptionContentSchema],
    default: [],
  })
  option_content: OptionContent[];
}

export const ConfigSchema = SchemaFactory.createForClass(Config).index({ package_name: "text" });
