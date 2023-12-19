import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";

export type CallkitDocument = Callkit & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Callkit {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  partner_id: User;

  @Prop({
    type: String,
    nullable: false,
    index: true,
  })
  room_name: String;

  @Prop({
    type: String,
    nullable: false,
  })
  type_server: String;

  @Prop({
    type: String,
    nullable: false,
  })
  call_type: String;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  first_ring: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  start_time: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  end_time: MongooseSchema.Types.Date;

  @Prop({
    type: Number,
    nullable: false,
    index: true,
    default: 0,
  })
  call_time: Number;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  token: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  partner_token: String;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
  })
  offer_candidates: String[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
  })
  answer_candidates: String[];

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  offer: String;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  answer: String;

  @Prop({
    type: String,
    nullable: true,
    default: 1,
  })
  version: Number;
}

export const CallkitSchema = SchemaFactory.createForClass(Callkit);
