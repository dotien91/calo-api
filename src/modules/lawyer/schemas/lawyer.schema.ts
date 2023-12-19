import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ChatMedia } from "../../../modules/chat_media/schemas/chat_media.schema";
import { City } from "../../../modules/city/schemas/city.schema";
import { User } from "../../../modules/user/schemas/user.schema";

@Schema()
export class LawyerLocation extends Document {
  @Prop({
    type: String,
  })
  type: string;

  @Prop({
    type: MongooseSchema.Types.Array,
  })
  coordinates: number[];
}
export const LawyerLocationSchema = SchemaFactory.createForClass(LawyerLocation);

@Schema()
export class DataCost extends Document {
  @Prop({
    type: String,
  })
  retainer: string;

  @Prop({
    type: String,
  })
  contingency: string;

  @Prop({
    type: String,
  })
  free_consultation: string;

  @Prop({
    type: String,
  })
  hourly_rates: string;
}
export const DataCostSchema = SchemaFactory.createForClass(DataCost);

@Schema()
export class DataCategory extends Document {
  @Prop({
    type: String,
  })
  slug: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "LawyerCategory",
  })
  ref_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
  })
  name: string;

  @Prop({
    type: String,
  })
  detail: string;

  @Prop({
    type: String,
  })
  year: string;

  @Prop({
    type: String,
  })
  percent: string;
}
export const DataCategorySchema = SchemaFactory.createForClass(DataCategory);

@Schema()
export class MapData extends Document {
  @Prop({
    type: String,
  })
  lawyer_id: string;

  @Prop({
    type: String,
  })
  address_id: string;

  @Prop({
    type: String,
  })
  standardized: string;

  @Prop({
    type: MongooseSchema.Types.Array,
  })
  latlong: string[];

  @Prop({
    type: String,
  })
  review_count: string;

  @Prop({
    type: String,
  })
  review_score: string;

  @Prop({
    type: String,
  })
  claimed_by: string;

  @Prop({
    type: String,
  })
  lawyer_name: string;

  @Prop({
    type: String,
  })
  headshot_url: string;
}
export const MapDataSchema = SchemaFactory.createForClass(MapData);

@Schema()
export class ContactLawyer extends Document {
  @Prop({
    type: String,
  })
  name: string;

  @Prop({
    type: String,
  })
  address: string;

  @Prop({
    type: String,
  })
  website: string;

  @Prop({
    type: String,
  })
  fax_number: string;

  @Prop({
    type: String,
  })
  mobile_number: string;

  @Prop({
    type: String,
  })
  office_number: string;
}
export const ContactLawyerSchema = SchemaFactory.createForClass(ContactLawyer);

@Schema()
export class LawyerAddress extends Document {
  @Prop({
    type: String,
  })
  text: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    nullable: true,
    default: null,
  })
  city: City;

  @Prop({
    type: String,
    default: null,
  })
  zip_code: string;
}
export const LawyerAddressSchema = SchemaFactory.createForClass(LawyerAddress);

@Schema()
export class WorkExperience extends Document {
  @Prop({
    type: String,
  })
  title: string;

  @Prop({
    type: String,
  })
  description: string;

  @Prop({
    type: String,
  })
  from_time: string;

  @Prop({
    type: String,
  })
  to_time: string;

  @Prop({
    type: String,
  })
  text_time: string;
}
export const WorkExperienceSchema = SchemaFactory.createForClass(WorkExperience);

@Schema()
export class Licensed extends Document {
  @Prop({
    type: String,
    nullable: true,
  })
  licensed_year: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  state: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  acquired: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  status: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  note: string;
}
export const LicensedSchema = SchemaFactory.createForClass(Licensed);

@Schema()
export class RatingValue extends Document {
  @Prop({
    type: Number,
    nullable: true,
  })
  star_number: number;

  @Prop({
    type: Number,
    nullable: true,
    default: 0,
  })
  star_value: number;
}
export const RatingValueSchema = SchemaFactory.createForClass(RatingValue);

export type LawyerDocument = Lawyer & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Lawyer {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  sub_name: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
    index: true,
  })
  state_name: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
    index: true,
  })
  city_name: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  position: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    nullable: true,
    default: null,
  })
  city: City;

  @Prop({
    type: String,
    nullable: false,
  })
  name: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    nullable: false,
    ref: "ChatMedia",
  })
  avatar: ChatMedia;

  @Prop({
    type: MongooseSchema.Types.Array,
    nullable: false,
    ref: "ChatMedia",
  })
  public_album: [ChatMedia];

  @Prop({
    type: MongooseSchema.Types.Array,
    nullable: false,
    ref: "ChatMedia",
  })
  awards: [ChatMedia];

  @Prop({
    type: LawyerAddressSchema,
    nullable: true,
    default: null,
  })
  address: LawyerAddress;

  @Prop({
    type: [LicensedSchema],
    nullable: false,
    default: [],
  })
  licensed: Licensed[];

  @Prop({
    type: String,
    nullable: false,
  })
  about: string;

  @Prop({
    type: String,
    nullable: false,
  })
  sub_about: string;

  @Prop({
    type: String,
    nullable: false,
    index: true,
  })
  ref_url: string;

  @Prop({
    type: Boolean,
    nullable: false,
    index: true,
  })
  is_free_consultation: boolean;

  @Prop({
    type: Boolean,
    nullable: false,
    index: true,
  })
  open_for_business: boolean;

  @Prop({
    type: Boolean,
    nullable: false,
    index: true,
  })
  is_misconduct: boolean;

  @Prop({
    type: Boolean,
    nullable: false,
    index: true,
  })
  is_extra_virtual: boolean;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    nullable: false,
    index: true,
  })
  categories: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: LawyerLocationSchema,
    default: {
      type: "Point",
      coordinates: [0, 0],
    },
  })
  loc: LawyerLocation;

  @Prop({
    type: DataCostSchema,
    nullable: true,
    default: true,
  })
  cost: DataCost;

  @Prop({
    type: [WorkExperienceSchema],
    nullable: true,
    default: null,
  })
  work_experience: WorkExperience[];

  @Prop({
    type: [DataCategorySchema],
    nullable: true,
    default: null,
  })
  category_data: DataCategory[];

  @Prop({
    type: [WorkExperienceSchema],
    nullable: true,
    default: null,
  })
  education: WorkExperience[];

  @Prop({
    type: [WorkExperienceSchema],
    nullable: true,
    default: null,
  })
  legal_case: WorkExperience[];

  @Prop({
    type: [WorkExperienceSchema],
    nullable: true,
    default: null,
  })
  associations: WorkExperience[];

  @Prop({
    type: [RatingValueSchema],
    nullable: true,
    default: null,
  })
  data_star: RatingValue[];

  @Prop({
    type: [WorkExperienceSchema],
    nullable: true,
    default: null,
  })
  honors: WorkExperience[];

  @Prop({
    type: [MapDataSchema],
    nullable: true,
    default: null,
  })
  map_data: MapData[];

  @Prop({
    type: [ContactLawyerSchema],
    nullable: true,
    default: [],
  })
  contact: ContactLawyer[];

  @Prop({
    type: MongooseSchema.Types.Array,
    nullable: false,
    default: null,
    index: true,
  })
  language_spoken: string[];

  @Prop({
    type: MongooseSchema.Types.Array,
    nullable: false,
    default: null,
  })
  payment_method: string[];

  @Prop({
    type: [WorkExperienceSchema],
    default: [],
    nullable: false,
  })
  honors_awards: WorkExperience[];

  @Prop({
    type: [WorkExperienceSchema],
    default: [],
    nullable: false,
  })
  publications: WorkExperience[];

  @Prop({
    type: [WorkExperienceSchema],
    default: [],
    nullable: false,
  })
  engagements: WorkExperience[];

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  like_number: number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
    index: true,
  })
  review_value: number;

  @Prop({
    type: Number,
    nullable: false,
    index: true,
    default: 0,
  })
  review_number: number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
    index: true,
  })
  license_year: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  longitude: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  points: number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  latitude: number;
}

export const LawyerSchema = SchemaFactory.createForClass(Lawyer)
  .index({ loc: "2dsphere" })
  .index({ name: "text", about: "text", sub_about: "text" });
