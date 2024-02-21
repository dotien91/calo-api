import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/schemas/user.schema";

export type UserPointHistoryDocument = UserPointHistory & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class UserPointHistory {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true })
  entity_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    nullable: false,
  })
  entity_type: String;

  @Prop({
    type: String,
    nullable: false,
  })
  entity_action: String;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  point: Number;
}

export const UserPointHistorySchema = SchemaFactory.createForClass(UserPointHistory);

