import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Plan, PlanSchema } from "../../../modules/plan/schemas/plan.schema";
import { User } from "../../../modules/user/schemas/user.schema";
import { EsimCountry, EsimCountrySchema } from "./esim_country.schema";

export type EsimDocument = Esim & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Esim {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  name: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  color: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  avatar: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  description: string;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  data_number: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  validity_number: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    nullable: false,
    index: true,
    ref: "EsimCountry",
  })
  country: EsimCountry;

  @Prop({
    type: MongooseSchema.Types.Array,
    nullable: false,
    index: true,
    ref: "EsimCountry",
  })
  supported_countries: EsimCountry[];

  @Prop({
    type: MongooseSchema.Types.Array,
    nullable: false,
    index: true,
  })
  network: string[];

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  plan_type: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  activation_policy: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  eKYC: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  top_up_option: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    nullable: false,
    index: true,
    ref: "Plan",
  })
  plan_id: Plan;

  @Prop({
    type: MongooseSchema.Types.Array,
    nullable: false,
    index: true,
  })
  available_top_up: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: String,
    default: "en",
    nullable: false,
    index: true,
  })
  language: string;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  buy_number: number;
}

export const EsimSchema = SchemaFactory.createForClass(Esim).index({
  name: "text",
  description: "text",
});
