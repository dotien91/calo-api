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
  type: String;

  @Prop({
    type: MongooseSchema.Types.Array,
  })
  coordinates: Number[];
}
export const LawyerLocationSchema = SchemaFactory.createForClass(LawyerLocation);

@Schema()
export class DataCost extends Document {
  @Prop({
    type: String,
  })
  retainer: String;

  @Prop({
    type: String,
  })
  contingency: String;

  @Prop({
    type: String,
  })
  free_consultation: String;

  @Prop({
    type: String,
  })
  hourly_rates: String;
}
export const DataCostSchema = SchemaFactory.createForClass(DataCost);

@Schema()
export class DataCategory extends Document {
  @Prop({
    type: String,
  })
  slug: String;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "LawyerCategory",
  })
  ref_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
  })
  name: String;

  @Prop({
    type: String,
  })
  detail: String;

  @Prop({
    type: String,
  })
  year: String;

  @Prop({
    type: String,
  })
  percent: String;
}
export const DataCategorySchema = SchemaFactory.createForClass(DataCategory);

@Schema()
export class MapData extends Document {
  @Prop({
    type: String,
  })
  lawyer_id: String;

  @Prop({
    type: String,
  })
  address_id: String;

  @Prop({
    type: String,
  })
  standardized: String;

  @Prop({
    type: MongooseSchema.Types.Array,
  })
  latlong: String[];

  @Prop({
    type: String,
  })
  review_count: String;

  @Prop({
    type: String,
  })
  review_score: String;

  @Prop({
    type: String,
  })
  claimed_by: String;

  @Prop({
    type: String,
  })
  lawyer_name: String;

  @Prop({
    type: String,
  })
  headshot_url: String;
}
export const MapDataSchema = SchemaFactory.createForClass(MapData);

@Schema()
export class ContactLawyer extends Document {
  @Prop({
    type: String,
  })
  name: String;

  @Prop({
    type: String,
  })
  address: String;

  @Prop({
    type: String,
  })
  website: String;

  @Prop({
    type: String,
  })
  fax_number: String;

  @Prop({
    type: String,
  })
  mobile_number: String;

  @Prop({
    type: String,
  })
  office_number: String;
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
  licensed_year: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  state: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  acquired: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  status: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  note: String;
}
export const LicensedSchema = SchemaFactory.createForClass(Licensed);

@Schema()
export class RatingValue extends Document {
  @Prop({
    type: Number,
    nullable: true,
  })
  star_number: Number;

  @Prop({
    type: Number,
    nullable: true,
    default: 0,
  })
  star_value: Number;
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
  sub_name: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
    index: true,
  })
  state_name: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
    index: true,
  })
  city_name: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  position: String;

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
  name: String;

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
  about: String;

  @Prop({
    type: String,
    nullable: false,
  })
  sub_about: String;

  @Prop({
    type: String,
    nullable: false,
    index: true,
  })
  ref_url: String;

  @Prop({
    type: Boolean,
    nullable: false,
    index: true,
  })
  is_free_consultation: Boolean;

  @Prop({
    type: Boolean,
    nullable: false,
    index: true,
  })
  open_for_business: Boolean;

  @Prop({
    type: Boolean,
    nullable: false,
    index: true,
  })
  is_misconduct: Boolean;

  @Prop({
    type: Boolean,
    nullable: false,
    index: true,
  })
  is_extra_virtual: Boolean;

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
  language_spoken: String[];

  @Prop({
    type: MongooseSchema.Types.Array,
    nullable: false,
    default: null,
  })
  payment_method: String[];

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
  like_number: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
    index: true,
  })
  review_value: Number;

  @Prop({
    type: Number,
    nullable: false,
    index: true,
    default: 0,
  })
  review_number: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
    index: true,
  })
  license_year: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  longitude: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  points: Number;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  latitude: Number;
}

export const LawyerSchema = SchemaFactory.createForClass(Lawyer)
  .index({ loc: "2dsphere" })
  .index({ name: "text", about: "text", sub_about: "text" });
