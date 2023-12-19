import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
export type EventCategoryDocument = EventCategory & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class EventCategory {
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
  name: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  description: string;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  icon: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "EventCategory" })
  parent_id: MongooseSchema.Types.ObjectId;
}

export const EventCategorySchema = SchemaFactory.createForClass(EventCategory);
