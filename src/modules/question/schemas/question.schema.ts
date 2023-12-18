import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Plan } from "../../../modules/plan/schemas/plan.schema";
import { User } from "../../../modules/user/schemas/user.schema";

export type QuestionDocument = Question & Document;

@Schema()
export class OptionQuestion extends Document {
  @Prop({
    type: String,
  })
  key: string;

  @Prop({
    type: String,
  })
  value: string;
}
export const OptionQuestionSchema = SchemaFactory.createForClass(OptionQuestion);

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Question {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({
    type: String,
    nullable: false,
  })
  name: String;

  @Prop({
    type: String,
    nullable: false,
    index: true
  })
  question_language: String;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  image: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
  })
  ref_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  public_album: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: String,
    nullable: false,
  })
  description: String;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Post",
  })
  parent_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  status: String;

  @Prop({
    type: String,
    default: "",
    index: true,
  })
  question_key: String;

  @Prop({
    type: [OptionQuestionSchema],
    default: [],
  })
  question: OptionQuestion[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question).index({
  name: "text",
  description: "text",
});
