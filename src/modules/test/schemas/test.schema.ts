import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type TestDocument = Test & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Test {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
  })
  created_user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.String,
    nullable: false,
  })
  title: string;

  @Prop({
    type: MongooseSchema.Types.String,
    nullable: false,
  })
  description: string;

  @Prop({
    type: MongooseSchema.Types.Number,
    nullable: false,
  })
  duration_time: number;

  @Prop({
    type: MongooseSchema.Types.Date,
    nullable: false,
  })
  start_time: string;

  @Prop({
    type: MongooseSchema.Types.Date,
    nullable: false,
  })
  end_time: string;
}

export const TestSchema = SchemaFactory.createForClass(Test);
