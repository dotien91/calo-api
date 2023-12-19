import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";

@Schema()
export class CountryLanguage extends Document {
  @Prop({
    type: String,
  })
  key: string;

  @Prop({
    type: String,
  })
  value: string;
}
export const CountryLanguageSchema = SchemaFactory.createForClass(CountryLanguage);

export type EsimCountryDocument = EsimCountry & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class EsimCountry {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

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
  name: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  country_code: String;

  @Prop({
    type: [CountryLanguageSchema],
    default: [],
  })
  translate: CountryLanguage[];
}

export const EsimCountrySchema = SchemaFactory.createForClass(EsimCountry).index({
  name: "text",
});
