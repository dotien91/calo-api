import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/schemas/user.schema";

export type TransactionBankDocument = TransactionBank & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class TransactionBank {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Channel", index: true })
  channel_id: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  payment_method: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  bank_name: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  bank_number: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  bank_account_name: string;
}

export const TransactionBankSchema = SchemaFactory.createForClass(TransactionBank);
