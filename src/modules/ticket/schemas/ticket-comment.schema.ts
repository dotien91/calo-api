import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { Ticket } from "./ticket.schema";

export type TicketCommentDocument = TicketComment & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class TicketComment {
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
  ticket_id: Ticket;

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

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "TicketComment", default: null, index: true })
  parent_id: TicketComment;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "TicketComment",
  })
  child: TicketComment[];

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  child_number: Number;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  attach_files: MongooseSchema.Types.ObjectId[];

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

export const TicketCommentSchema = SchemaFactory.createForClass(TicketComment).index({
  content: "text",
});
