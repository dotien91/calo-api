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
  room_name: string;

  @Prop({
    type: String,
    nullable: false,
  })
  type_server: string;

  @Prop({
    type: String,
    nullable: false,
  })
  call_type: string;

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
  call_time: number;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  token: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  partner_token: string;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
  })
  offer_candidates: string[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
  })
  answer_candidates: string[];

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  offer: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  answer: string;

  @Prop({
    type: String,
    nullable: true,
    default: 1,
  })
  version: number;

  @Prop({
    type: Boolean,
    nullable: true,
    default: true,
  })
  is_mic: boolean;

  @Prop({
    type: Boolean,
    nullable: true,
    default: true,
  })
  is_camera: boolean;

  @Prop({
    type: String,
    nullable: true,
    default: "front",
  })
  camera_position: boolean;
}

export const CallkitSchema = SchemaFactory.createForClass(Callkit);
