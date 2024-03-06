import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { TestStatus } from "../interfaces/test.interface.i";

export type TestUserDocument = TestUser & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class TestUser {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
    nullable: false,
  })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Test",
    nullable: false,
  })
  test_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
  })
  answers: any[];

  @Prop({
    type: MongooseSchema.Types.Number,
  })
  band: number;

  @Prop({
    type: MongooseSchema.Types.Number,
  })
  finished_time: number;

  @Prop({
    type: MongooseSchema.Types.String,
    enum: TestStatus,
    default: TestStatus.PENDING,
  })
  status: TestStatus;
}

export const TestUserSchema = SchemaFactory.createForClass(TestUser);
