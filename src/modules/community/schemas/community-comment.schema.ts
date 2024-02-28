import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../../modules/user/schemas/user.schema";
import { Community } from "./community.schema";

export type CommunityCommentDocument = CommunityComment & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class CommunityComment {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    nullable: false,
    index: true,
  })
  community_id: Community;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  content: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  ref_id: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  ref_parent_id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "CommunityComment", default: null, index: true })
  parent_id: CommunityComment;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "CommunityComment",
  })
  child: CommunityComment[];

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  child_number: number;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "User",
  })
  up_vote: User[];

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  vote_number: number;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "User",
  })
  down_vote: User[];
}

export const CommunityCommentSchema = SchemaFactory.createForClass(CommunityComment).index({
  content: "text",
});
