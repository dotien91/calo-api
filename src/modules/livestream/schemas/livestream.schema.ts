import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Channel } from "../../../modules/channel/schemas/channel.schema";
import { Plan } from "../../../modules/plan/schemas/plan.schema";
import { User } from "../../../modules/user/schemas/user.schema";

export type LivestreamDocument = Livestream & Document;
@Schema()
export class LivestreamReact extends Document {
  @Prop({
    type: Number,
  })
  haha_value: number;

  @Prop({
    type: Number,
  })
  like_value: number;

  @Prop({
    type: Number,
  })
  love_value: number;

  @Prop({
    type: Number,
  })
  care_value: number;

  @Prop({
    type: Number,
  })
  wow_value: number;

  @Prop({
    type: Number,
  })
  sad_value: number;

  @Prop({
    type: Number,
  })
  angry_value: number;
}
export const LivestreamReactSchema = SchemaFactory.createForClass(LivestreamReact);

@Schema()
export class LivestreamHistoryPlayback extends Document {
  @Prop({
    type: String,
  })
  hls: string;

  @Prop({
    type: String,
  })
  dash: string;
}
export const LivestreamHistoryPlaybackSchema = SchemaFactory.createForClass(LivestreamHistoryPlayback);

@Schema()
export class LivestreamHistory extends Document {
  @Prop({
    type: String,
  })
  uid: string;

  @Prop({
    type: String,
  })
  thumbnail: string;

  @Prop({
    type: String,
  })
  created: string;

  @Prop({
    type: String,
  })
  modified: string;

  @Prop({
    type: LivestreamHistoryPlaybackSchema,
    default: null,
  })
  playback: LivestreamHistoryPlayback;
}
export const LivestreamHistorySchema = SchemaFactory.createForClass(LivestreamHistory);

@Schema()
export class LivstreamData extends Document {
  @Prop({
    type: String,
  })
  haha_value: number;

  @Prop({
    type: String,
  })
  rtmp_url: string;

  @Prop({
    type: String,
  })
  m3u8_url: string;

  @Prop({
    type: String,
  })
  ingest_endpoint: string;

  @Prop({
    type: String,
  })
  stream_key: string;
}
export const LivstreamDataSchema = SchemaFactory.createForClass(LivstreamData);

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Livestream {
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
  language: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  avatar: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  media_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  title: string;

  @Prop({ type: MongooseSchema.Types.Date })
  start_time: MongooseSchema.Types.Date;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  caption: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  cookies: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "ChatMedia",
  })
  ref_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
    ref: "Course",
  })
  product_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    default: "",
    nullable: false,
    index: true,
  })
  country: string;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  like_number: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  view_number: number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  comment_number: number;

  @Prop({
    type: String,
    default: "wait",
    nullable: false,
  })
  livestream_status: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  ready_status: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  input_type: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  livestream_source: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  whip_data: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  whep_data: string;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  cloudflare_stream_id: string;

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  music_id: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.Array,
    default: [],
    ref: "ChatMedia",
  })
  hashtag_id: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: LivestreamReactSchema,
    default: {
      haha_value: 0,
      like_value: 0,
      love_value: 0,
      care_value: 0,
      wow_value: 0,
      sad_value: 0,
      angry_value: 0,
    },
  })
  react_value: LivestreamReact;

  @Prop({
    type: LivstreamDataSchema,
    default: {
      rtmp_url: "",
      m3u8_url: "",
      ingest_endpoint: "",
      stream_key: "",
    },
  })
  livestream_data: LivstreamData;

  @Prop({
    type: [LivestreamHistorySchema],
    default: [],
  })
  history_media: LivestreamHistory[];
}

export const LivestreamSchema = SchemaFactory.createForClass(Livestream);
