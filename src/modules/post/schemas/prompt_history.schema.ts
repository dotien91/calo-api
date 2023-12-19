import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { UserAnonymous } from "../../../modules/user/schemas/user_anonymous.schema";
import { PostAnonymous } from "./post_anonymous.schema";
import { PostCategory } from "./post_category.schema";

export type PromptHistoryDocument = PromptHistory & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class PromptHistory {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "PromptHistory",
    nullable: true,
  })
  parent_id: PromptHistory;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "PostAnonymous",
    index: true,
  })
  prompt_user: PostAnonymous;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  chat_content: string;

  @Prop({
    type: String,
    nullable: true,
    default: "",
  })
  chat_content_to_ai: string;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  media_ids: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: String,
    default: "group",
  })
  chat_type: string;

  @Prop({
    type: String,
    default: "",
  })
  chat_status: string;

  @Prop({ type: MongooseSchema.Types.Date, default: Date.now })
  send_at: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.Date })
  read_at: MongooseSchema.Types.Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "UserAnonymous" })
  createBy: UserAnonymous;
}

export const PromptHistorySchema = SchemaFactory.createForClass(PromptHistory).index({
  chat_content: "text",
});
