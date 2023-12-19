import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
export type EventRatingDocument = EventRating & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class EventRating {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  rating_media: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  description: string;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  number_value: number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  number_accuracy: number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  number_communication: number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  number_location: number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  number_check_in: number;

  @Prop({
    type: Number,
    nullable: false,
    default: 0,
  })
  number_for_value: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Event" })
  event_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  user_id: MongooseSchema.Types.ObjectId;
}

export const EventRatingSchema = SchemaFactory.createForClass(EventRating);
