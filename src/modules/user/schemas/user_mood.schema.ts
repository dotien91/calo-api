import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type UserMoodDocument = UserMood & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class UserMood {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  user_id: User;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  text: String;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  image: String;
}

export const UserMoodSchema = SchemaFactory.createForClass(UserMood);
