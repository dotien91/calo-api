import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
export type LawyerRawDocument = LawyerRaw & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class LawyerRaw {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    nullable: false,
    default: "",
    index: true
  })
  url: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  data: String;
}

export const LawyerRawSchema = SchemaFactory.createForClass(LawyerRaw);
