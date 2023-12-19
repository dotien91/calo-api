import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { TransactionBank } from "./transaction_bank.schema";

export type TransactionDocument = Transaction & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Transaction {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  from_user: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "TransactionBank", index: true })
  transaction_bank: TransactionBank;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Channel", index: true })
  channel_id: String;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    nullable: true,
  })
  ref_id: ObjectId;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  ref_type: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  ref_name: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  ref_url: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    nullable: true,
  })
  ref_avatar: String;

  @Prop({
    type: Number,
    default: 0,
  })
  last_coin: number;

  @Prop({
    type: Number,
    default: 0,
  })
  current_coin: number;

  @Prop({
    type: Number,
    default: 0,
  })
  last_token: number;

  @Prop({
    type: Number,
    default: 0,
  })
  current_token: number;

  @Prop({
    type: Number,
    default: 0,
  })
  transaction_value: number;

  @Prop({
    type: Number,
    default: 0,
  })
  commission_value: number;

  @Prop({
    type: Number,
    default: 0,
  })
  income_value: number;

  @Prop({
    type: String,
    nullable: true,
    default: "plus",
  })
  method: string;

  @Prop({
    type: String,
    nullable: true,
    default: "system",
  })
  type_system: string;

  @Prop({
    type: String,
    nullable: true,
    default: "output",
  })
  transaction_type: string;

  @Prop({
    type: String,
    nullable: true,
  })
  note: string;

  @Prop({
    type: String,
    nullable: true,
  })
  admin_note: string;

  @Prop({
    type: String,
    default: "done",
    index: true,
  })
  status: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  trans_id: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  error_message: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  data_payment: string;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  billing_on: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  processing_on: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  successfully_on: MongooseSchema.Types.Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
