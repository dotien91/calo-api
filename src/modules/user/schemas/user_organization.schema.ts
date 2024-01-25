import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type UserOrganizationDocument = UserOrganization & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class UserOrganization {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
  })
  name: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  logo: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  cover: string;

  @Prop({
    type: String,
    default: "",
  })
  address: string;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  phone_number: string;

  @Prop({
    type: String,
    default: "",
  })
  description: string;

  @Prop({
    type: String,
    default: "",
  })
  long_description: string;
}

export const UserOrganizationSchema = SchemaFactory.createForClass(UserOrganization);

