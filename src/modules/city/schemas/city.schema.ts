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
  type: String;

  @Prop({
    type: MongooseSchema.Types.Array,
  })
  coordinates: Number[];
}
export const UserLocationSchema = SchemaFactory.createForClass(UserLocation);

@Schema()
export class NameCity extends Document {
  @Prop({
    type: String,
  })
  language: String;

  @Prop({
    type: String,
  })
  name: String;
}
export const NameCitySchema = SchemaFactory.createForClass(NameCity);

@Schema()
export class UserPolygon extends Document {
  @Prop({
    type: String,
  })
  type: String;

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
  city_name: String;

  @Prop({
    type: String,
    nullable: false,
  })
  city_ascii: String;

  @Prop({
    type: String,
    nullable: false,
    index: true,
  })
  capital: String;

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
  country: String;

  @Prop({
    type: String,
    nullable: false,
    index: true,
  })
  index_name: String;

  @Prop({
    type: String,
    nullable: false,
    index: true,
    default: "",
  })
  country_code: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
    index: true,
  })
  country_iso2: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  country_iso3: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
    index: true,
  })
  localname: String;

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
  avatar: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  avatar_thumbnail: String;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
    index: true,
  })
  user_number: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
    index: true,
  })
  visit_number: Number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "ChatRoom", default: null, index: true, nullable: true })
  chat_group: ChatRoom;

  @Prop({
    type: Number,
    nullable: false,
    index: true,
    default: 0,
  })
  is_viewable: Number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "ChatMedia",
  })
  city_image: ChatMedia;
}

export const CitySchema = SchemaFactory.createForClass(City)
  .index({ loc: "2dsphere" })
  .index({ geometry: "2dsphere" })
  .index({ city_name: "text", index_name: "text", localname: "text" })
