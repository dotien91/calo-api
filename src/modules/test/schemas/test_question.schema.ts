import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { TestQuestionPart, TestQuestionType } from "../interfaces/test.interface.i";

export type TestQuestionDocument = TestQuestion & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class TestQuestion {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Test",
    nullable: false,
  })
  test_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "TestQuestion",
  })
  parent_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Media",
  })
  media_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.String,
  })
  question: string;

  @Prop({
    type: MongooseSchema.Types.String,
  })
  content: string;

  @Prop({
    type: MongooseSchema.Types.String,
    enum: TestQuestionType,
  })
  type: TestQuestionType;

  @Prop({
    type: MongooseSchema.Types.String,
    enum: TestQuestionPart,
    nullable: false,
  })
  part: TestQuestionPart;

  @Prop({
    type: MongooseSchema.Types.Number,
    nullable: false,
  })
  index: number;

  @Prop({
    type: MongooseSchema.Types.String,
    nullable: false,
  })
  answer: string;
}

export const TestQuestionSchema = SchemaFactory.createForClass(TestQuestion);
