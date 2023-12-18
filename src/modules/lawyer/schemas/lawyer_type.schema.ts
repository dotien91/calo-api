import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
export type LawyerTypeDocument = LawyerType & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class LawyerType {
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
  name: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  description: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  icon: String;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "LawyerType" })
  parent_id: MongooseSchema.Types.ObjectId;
}

export const LawyerTypeSchema = SchemaFactory.createForClass(LawyerType);
