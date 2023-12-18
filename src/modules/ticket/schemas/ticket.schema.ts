import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { TicketCategory } from "./ticket-category.schema";
import { Channel } from "../../../modules/channel/schemas/channel.schema";
import { ContactForm } from "../../../modules/contact_form/schemas/contact_form.schema";

export type TicketDocument = Ticket & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Ticket {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Array, ref: "User", index: true })
  user_id: User[];

  @Prop({ type: MongooseSchema.Types.Array, ref: "Channel", index: true })
  channel_id: Channel[];

  @Prop({
    type: String,
    default: "en",
    nullable: false,
    index: true,
  })
  post_language: String;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "TicketCategory", index: true })
  post_category: TicketCategory;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  post_title: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  post_content: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  post_excerpt: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  post_slug: String;

  @Prop({
    type: String,
    default: "US",
    nullable: false,
    index: true,
  })
  country: String;

  @Prop({
    type: String,
    default: "open",
    nullable: false,
  })
  post_status: String;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  post_avatar: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  attach_files: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  post_type: String;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  view_number: Number;

  @Prop({
    type: Number,
    default: 1,
    nullable: false,
    index: true,
  })
  is_comment: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  comment_number: Number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "ContactForm", index: true })
  data_id: ContactForm;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket).index({
  post_title: "text",
  post_content: "text",
});
