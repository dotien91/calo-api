import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Channel } from "../../../modules/channel/schemas/channel.schema";
import { User } from "../../../modules/user/schemas/user.schema";

export type TicketCategoryDocument = TicketCategory & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class TicketCategory {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Channel", index: true })
  channel_id: Channel;

  @Prop({
    type: String,
    default: "en",
    nullable: false,
    index: true,
  })
  category_language: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  category_content: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  category_excerpt: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  category_parent: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  category_slug: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  category_status: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  category_avatar: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  category_title: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  category_type: string;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  category_view: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
    index: true,
  })
  version: number;

  @Prop({
    type: Number,
    default: 1,
    nullable: false,
    index: true,
  })
  public_status: number;
}

export const TicketCategorySchema = SchemaFactory.createForClass(TicketCategory).index({
  category_title: "text",
  category_content: "text",
});
