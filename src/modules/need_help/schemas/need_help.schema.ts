import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
export type NeedHelpDocument = NeedHelp & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class NeedHelp {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true, ref: "User" })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    nullable: false,
  })
  help_title: String;

  @Prop({
    type: String,
    nullable: false,
  })
  help_description: String;

  @Prop({
    type: String,
    nullable: false,
    default: "en",
  })
  language: String;
}

export const NeedHelpSchema = SchemaFactory.createForClass(NeedHelp);
