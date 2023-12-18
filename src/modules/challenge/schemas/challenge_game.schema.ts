import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Challenge } from './challenge.schema';
import { ChatMedia } from '../../../modules/chat_media/schemas/chat_media.schema';
import { Channel } from '../../../modules/channel/schemas/channel.schema';

export type ChallengeGameDocument = ChallengeGame & Document;

@Schema()
export class GameActivity extends Document {
  @Prop({
    type: String,
  })
  name: String;

  @Prop({
    type: String,
  })
  description: string;

  @Prop({
    type: Number,
  })
  point_tracking: Number;

  @Prop({
    type: String
  })
  module_tracking: String;
}

export const GameActivitySchema = SchemaFactory.createForClass(GameActivity);


@Schema()
export class GameCustomField extends Document {
  @Prop({
    type: String,
  })
  name: String;

  @Prop({
    type: String,
  })
  field_type: string;

  @Prop({
    type: Number,
  })
  default_value: Number;

  @Prop({
    type: String
  })
  max_value: String;

  @Prop({
    type: String
  })
  min_value: String;
}

export const GameCustomFieldSchema = SchemaFactory.createForClass(GameCustomField);
@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class ChallengeGame {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  user_id: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Channel', index: true })
  channel_id: Channel;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  title: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  description: String;

  @Prop({
    type: String,
    default: "",
    nullable: false,
  })
  game_type: String;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChatMedia', index: true })
  media_id: ChatMedia

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChallengeGame', index: true })
  parent_id: ChallengeGame

  @Prop({
    type: [GameCustomFieldSchema],
    default: [],
  })
  custom_field: GameCustomField[];

  @Prop({
    type: [GameActivitySchema],
    default: [],
  })
  game_activity: GameActivity[];
}

export const ChallengeGameSchema = SchemaFactory.createForClass(ChallengeGame);
