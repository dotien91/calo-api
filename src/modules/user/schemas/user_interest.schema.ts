import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "./user.schema";

export type UserInterestDocument = UserInterest & Document;
@Schema()
export class UserInterestMeta extends Document {
  @Prop({
    type: String,
  })
  key: string;

  @Prop({
    type: String,
  })
  value: string;
}
export const UserInterestMetaSchema = SchemaFactory.createForClass(UserInterestMeta);

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class UserInterest {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  interest_key: String;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserInterest", index: true })
  parent_id: UserInterest;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  name: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  description: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  color: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  image: String;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  cover: MongooseSchema.Types.ObjectId;

  @Prop({
    type: Number,
    default: 0,
    index: true,
  })
  priority: Number;

  @Prop({
    type: [UserInterestMetaSchema],
    default: null,
  })
  name_object: UserInterestMeta[];

  @Prop({
    type: [UserInterestMetaSchema],
    default: null,
  })
  description_object: UserInterestMeta[];
}

export const UserInterestSchema = SchemaFactory.createForClass(UserInterest);
