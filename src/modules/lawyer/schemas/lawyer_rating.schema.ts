import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Lawyer } from "./lawyer.schema";
export type LawyerRatingDocument = LawyerRating & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class LawyerRating {
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
  title: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  created_by: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  description: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  response: string;

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

  @Prop({ type: MongooseSchema.Types.Date, default: Date.now })
  created_time: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Lawyer" })
  lawyer_id: Lawyer;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  createBy: MongooseSchema.Types.ObjectId;
}

export const LawyerRatingSchema = SchemaFactory.createForClass(LawyerRating);
