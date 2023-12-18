import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type ReportDocument = Report & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Report {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true, ref: "User" })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true, ref: "User" })
  partner_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    index: true,
    default: "report",
    nullable: false,
  })
  report_type: String;

  @Prop({
    type: String,
    default: "",
  })
  report_content: String;

  @Prop({
    type: String,
    default: "pending",
  })
  report_status: String;

  @Prop({
    type: String,
    default: "",
  })
  report_image: String;

  @Prop({
    type: String,
    default: "",
  })
  report_email: String;

  @Prop({
    type: String,
    default: "",
  })
  report_name: String;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
