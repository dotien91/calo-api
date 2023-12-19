import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "./user.schema";

export type UserQuestionDocument = UserQuestion & Document;

export type UserQuestionMetaDocument = UserQuestionMeta & Document;

@Schema()
export class UserQuestionMeta extends Document {
  @Prop({
    type: String,
  })
  key: string;

  @Prop({
    type: String,
  })
  value: string;
}
export const UserQuestionMetaSchema = SchemaFactory.createForClass(UserQuestionMeta);

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class UserQuestion {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  note: string;

  @Prop({
    type: [UserQuestionMetaSchema],
    default: [],
  })
  question: UserQuestionMeta[];

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  image: string;
}

export const UserQuestionSchema = SchemaFactory.createForClass(UserQuestion);
