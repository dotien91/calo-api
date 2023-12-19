import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Plan } from "../../../modules/plan/schemas/plan.schema";
import { User } from "../../../modules/user/schemas/user.schema";
import { Question } from "./question.schema";

export type AnswerDocument = Answer & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Answer {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Question",
    index: true,
  })
  question_id: Question;

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  answer: string;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  point: number;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  status: string;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer).index({
  post_title: "text",
  post_content: "text",
});
