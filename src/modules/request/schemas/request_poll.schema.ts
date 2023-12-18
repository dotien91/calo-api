import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Request } from "./request.schema";

export type RequestPollDocument = RequestPoll & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class RequestPoll {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  created_by: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Request", index: true })
  request_id: Request;

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  question: String;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  number_choose: Number;

  @Prop({ type: MongooseSchema.Types.Array, ref: "User", index: true, default: [] })
  users_choose: User[];
}

export const RequestPollSchema = SchemaFactory.createForClass(RequestPoll);
