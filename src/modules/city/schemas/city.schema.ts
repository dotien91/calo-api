import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ChatMedia } from "../../../modules/chat_media/schemas/chat_media.schema";
import { ChatRoom } from "../../../modules/chat_room/schemas/chat_room.schema";

export type CityDocument = City & Document;

@Schema()
export class UserLocation extends Document {
  @Prop({
    type: String,
  })
  type: string;

  @Prop({
    type: MongooseSchema.Types.Array,
  })
  coordinates: number[];
}
export const UserLocationSchema = SchemaFactory.createForClass(UserLocation);

@Schema()
export class NameCity extends Document {
  @Prop({
    type: String,
  })
  language: string;

  @Prop({
    type: String,
  })
  name: string;
}
export const NameCitySchema = SchemaFactory.createForClass(NameCity);

@Schema()
export class UserPolygon extends Document {
  @Prop({
    type: String,
  })
  type: string;

  @Prop({
    type: MongooseSchema.Types.Array,
  })
  coordinates: [][];
}
export const UserPolygonSchema = SchemaFactory.createForClass(UserPolygon);

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class City {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    nullable: false,
  })
  city_name: string;

  @Prop({
    type: String,
    nullable: false,
  })
  city_ascii: string;

  @Prop({
    type: String,
    nullable: false,
    index: true,
  })
  capital: string;

  @Prop({
    type: UserLocationSchema,
    default: {
      type: "Point",
      coordinates: [0, 0],
    },
  })
  loc: UserLocation;

  @Prop({
    type: UserPolygonSchema,
    default: null,
  })
  geometry: UserPolygon;

  @Prop({
    type: String,
    nullable: false,
    index: true,
    default: "",
  })
  country: string;

  @Prop({
    type: String,
    nullable: false,
    index: true,
  })
  index_name: string;

  @Prop({
    type: String,
    nullable: false,
    index: true,
    default: "",
  })
  country_code: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
    index: true,
  })
  country_iso2: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  country_iso3: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
    index: true,
  })
  localname: string;

  @Prop({
    type: [NameCitySchema],
    nullable: false,
    default: [],
  })
  names: NameCity[];

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  avatar: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  avatar_thumbnail: string;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
    index: true,
  })
  user_number: number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
    index: true,
  })
  visit_number: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "ChatRoom", default: null, index: true, nullable: true })
  chat_group: ChatRoom;

  @Prop({
    type: Number,
    nullable: false,
    index: true,
    default: 0,
  })
  is_viewable: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "ChatMedia",
  })
  city_image: ChatMedia;
}

export const CitySchema = SchemaFactory.createForClass(City)
  .index({ loc: "2dsphere" })
  .index({ geometry: "2dsphere" })
  .index({ city_name: "text", index_name: "text", localname: "text" });
