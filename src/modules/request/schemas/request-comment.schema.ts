import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { Request } from "./request.schema";

export type RequestCommentDocument = RequestComment & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class RequestComment {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    nullable: false,
    index: true,
  })
  request_id: Request;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  content: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  ref_id: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  ref_parent_id: String;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "RequestComment", default: null, index: true })
  parent_id: RequestComment;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "RequestComment",
  })
  child: RequestComment[];

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  child_number: Number;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "User",
  })
  up_vote: User[];

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  vote_number: Number;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "User",
  })
  down_vote: User[];
}

export const RequestCommentSchema = SchemaFactory.createForClass(RequestComment).index({
  content: "text",
});
