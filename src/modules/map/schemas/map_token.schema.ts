import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type MapTokenDocument = MapToken & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class MapToken {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  access_token: String;

  @Prop({
    type: String,
    nullable: false,
    default: "",
  })
  token_type: String;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  expired_at: MongooseSchema.Types.Date;
}

export const MapTokenSchema = SchemaFactory.createForClass(MapToken);
