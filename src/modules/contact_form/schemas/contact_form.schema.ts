import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Post } from "../../../modules/post/schemas/post.schema";

export type ContactFormDocument = ContactForm & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class ContactForm {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true, ref: "User" })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true, ref: "User" })
  partner_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true, ref: "Post" })
  entity_id: Post;

  @Prop({
    type: String,
    nullable: false,
  })
  full_name: string;

  @Prop({
    type: String,
    nullable: false,
  })
  address: string;

  @Prop({
    type: String,
    nullable: false,
  })
  phone_number: string;

  @Prop({
    type: String,
    nullable: false,
  })
  country_phone_number: string;

  @Prop({
    type: String,
    nullable: false,
  })
  bank_name: string;

  @Prop({
    type: String,
    nullable: false,
  })
  bank_number: string;

  @Prop({
    type: String,
    nullable: false,
  })
  bank_account_name: string;

  @Prop({
    type: String,
    index: true,
    default: "enroll",
    nullable: false,
  })
  form_type: string;

  @Prop({
    type: String,
    index: true,
    default: "pending",
    nullable: false,
  })
  form_status: string;

  @Prop({
    type: String,
    default: "",
  })
  content: string;

  @Prop({
    type: String,
    default: "",
  })
  image: string;

  @Prop({
    type: String,
    default: "",
  })
  email: string;

  @Prop({
    type: String,
    default: "",
  })
  note: string;
}

export const ContactFormSchema = SchemaFactory.createForClass(ContactForm);
