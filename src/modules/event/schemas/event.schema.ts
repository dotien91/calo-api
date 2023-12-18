import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Channel } from "node:diagnostics_channel";
import { Course } from "../../../modules/course/schemas/course.schema";
import { Livestream } from "../../../modules/livestream/schemas/livestream.schema";
export type EventDocument = Event & Document;

@Schema()
export class EventAddress extends Document {
  @Prop({
    type: String,
  })
  key: string;

  @Prop({
    type: String,
  })
  value: string;
}
export const EventAddressSchema = SchemaFactory.createForClass(EventAddress);

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
export class TicketInforMation extends Document {
  @Prop({
    type: String,
    default: "",
  })
  title: String;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  price: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  special_price: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  description: Number;

  @Prop({
    type: String,
    default: "",
  })
  image: String;
}
export const TicketInforMationSchema = SchemaFactory.createForClass(TicketInforMation);

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Event {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  country: String;

  @Prop({ type: MongooseSchema.Types.ObjectId, default: null, nullable: true, index: true })
  city: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Channel", index: true })
  channel_id: Channel;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  title: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  description: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  address_full: String;

  @Prop({
    type: [EventAddressSchema],
    nullable: true,
    default: [],
  })
  address: EventAddress[];

  @Prop({
    type: [TicketInforMationSchema],
    nullable: true,
    default: [],
  })
  ticket: TicketInforMation[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    index: true,
  })
  hash_tag: [String];

  @Prop({
    type: UserLocationSchema,
    default: {
      type: "Point",
      coordinates: [0, 0],
    },
  })
  loc: UserLocation;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  rating_value: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  rating_number: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
    index: true,
  })
  max_price: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
    index: true,
  })
  min_price: Number;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  public_album: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "User",
  })
  interested: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "EventCategory",
  })
  category: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "EventType",
    index: true,
  })
  type: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Livestream",
    index: true,
  })
  livestream_id: Livestream;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatRoom",
    index: true,
  })
  group_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    nullable: false,
    default: 0,
  })
  interested_number: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  like_number: Number;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "User",
  })
  like: MongooseSchema.Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  open_date: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  end_date: MongooseSchema.Types.Date;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  end_occurrences: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  duration: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  is_recurring: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  repeat_every: Number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  is_remind: Number;

  @Prop({
    type: MongooseSchema.Types.Array,
    nullable: false,
    default: [],
  })
  repeat_on: String[];

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  permission: String;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  open_ticket_date: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  pre_order_date: MongooseSchema.Types.Date;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  event_level: String;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Course" })
  event_course: Course;
}

export const EventSchema = SchemaFactory.createForClass(Event)
  .index({ loc: "2dsphere" })
  .index({ title: "text", description: "text", address_full: "text" });
