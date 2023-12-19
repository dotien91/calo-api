import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type UserPermissionDocument = UserPermission & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class UserPermission {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    nullable: false,
  })
  permission: string;

  @Prop({
    type: String,
    default: "",
    nullable: true,
  })
  group: string;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  expired_at: MongooseSchema.Types.Date;
}

export const UserPermissionSchema = SchemaFactory.createForClass(UserPermission);
