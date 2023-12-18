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
  haha_value: Number;

  @Prop({
    type: Number,
  })
  like_value: Number;

  @Prop({
    type: Number,
  })
  love_value: Number;

  @Prop({
    type: Number,
  })
  care_value: Number;

  @Prop({
    type: Number,
  })
  wow_value: Number;

  @Prop({
    type: Number,
  })
  sad_value: Number;

  @Prop({
    type: Number,
  })
  angry_value: Number;
}
export const LivestreamReactSchema = SchemaFactory.createForClass(LivestreamReact);

@Schema()
export class LivestreamHistoryPlayback extends Document {
  @Prop({
    type: String,
  })
  hls: String;

  @Prop({
    type: String,
  })
  dash: String;
}
export const LivestreamHistoryPlaybackSchema = SchemaFactory.createForClass(LivestreamHistoryPlayback);

@Schema()
export class LivestreamHistory extends Document {
  @Prop({
    type: String,
  })
  uid: String;

  @Prop({
    type: String,
  })
  thumbnail: String;

  @Prop({
    type: String,
  })
  created: String;

  @Prop({
    type: String,
  })
  modified: String;

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
  haha_value: Number;

  @Prop({
    type: String,
  })
  rtmp_url: String;

  @Prop({
    type: String,
  })
  m3u8_url: String;

  @Prop({
    type: String,
  })
  ingest_endpoint: String;

  @Prop({
    type: String,
  })
  stream_key: String;
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
  language: String;

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
  title: String;

  @Prop({ type: MongooseSchema.Types.Date })
  start_time: MongooseSchema.Types.Date;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  caption: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  cookies: String;

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
  country: String;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  like_number: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  view_number: Number;

  @Prop({
    type: Number,
    default: 0,
    nullable: false,
  })
  comment_number: Number;

  @Prop({
    type: String,
    default: "wait",
    nullable: false,
  })
  livestream_status: String;

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
  input_type: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  livestream_source: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  whip_data: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  whep_data: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  cloudflare_stream_id: String;

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
