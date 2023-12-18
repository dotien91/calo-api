import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, Schema as MongooseSchema } from "mongoose";
import { Channel } from "../../../modules/channel/schemas/channel.schema";
import { ChatMedia } from "../../../modules/chat_media/schemas/chat_media.schema";
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

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true, })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true, })
  from_user: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "TransactionBank", index: true, })
  transaction_bank: TransactionBank;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Channel", index: true, })
  channel_id: Channel;

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
  ref_type: String

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  ref_name: String

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  ref_url: String

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    nullable: true,
  })
  ref_avatar: ChatMedia

  @Prop({
    type: Number,
    default: 0,
  })
  last_coin: Number;

  @Prop({
    type: Number,
    default: 0,
  })
  current_coin: Number;

  @Prop({
    type: Number,
    default: 0,
  })
  last_token: Number;

  @Prop({
    type: Number,
    default: 0,
  })
  current_token: Number;

  @Prop({
    type: Number,
    default: 0,
  })
  transaction_value: Number;

  @Prop({
    type: Number,
    default: 0,
  })
  commission_value: Number;

  @Prop({
    type: Number,
    default: 0,
  })
  income_value: Number;

  @Prop({
    type: String,
    nullable: true,
    default: "plus",
  })
  method: String

  @Prop({
    type: String,
    nullable: true,
    default: "system",
  })
  type_system: String

  @Prop({
    type: String,
    nullable: true,
    default: "output",
  })
  transaction_type: String

  @Prop({
    type: String,
    nullable: true
  })
  note: String

  @Prop({
    type: String,
    nullable: true
  })
  admin_note: String

  @Prop({
    type: String,
    default: "done",
    index: true,
  })
  status: String;

  @Prop({
    type: String,
    default: "",
    nullable: true
  })
  trans_id: String

  @Prop({
    type: String,
    default: "",
    nullable: true
  })
  error_message: String

  @Prop({
    type: String,
    default: "",
    nullable: true
  })
  data_payment: String

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  billing_on: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  processing_on: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  successfully_on: MongooseSchema.Types.Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
