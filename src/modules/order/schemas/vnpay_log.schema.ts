import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
export type VnpayLogDocument = VnpayLog & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class VnpayLog {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    nullable: false,
  })
  ip_address: String;

  @Prop({
    type: String,
    nullable: false,
  })
  data_log: String;
}

export const VnpayLogSchema = SchemaFactory.createForClass(VnpayLog);
