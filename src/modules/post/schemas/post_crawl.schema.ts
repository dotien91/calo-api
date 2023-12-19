import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type PostCrawlDocument = PostCrawl & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class PostCrawl {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    nullable: false,
    index: true,
  })
  slug: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  url: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  data: string;

  @Prop({
    type: String,
    default: "0",
    nullable: false,
    index: true,
  })
  status: string;
}

export const PostCrawlSchema = SchemaFactory.createForClass(PostCrawl);
