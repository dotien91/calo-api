import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Event } from "./event.schema";
export type EventIndexDocument = EventIndex & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class EventIndex {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Event" })
  event_id: Event;

  @Prop({ type: MongooseSchema.Types.Date, default: null, index: true })
  event_date: MongooseSchema.Types.Date;
}

export const EventIndexSchema = SchemaFactory.createForClass(EventIndex);
