import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
export type LawyerReportDocument = LawyerReport & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class LawyerReport {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  report_key: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  report_value: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Lawyer" })
  event_id: MongooseSchema.Types.ObjectId;
}

export const LawyerReportSchema = SchemaFactory.createForClass(LawyerReport);
