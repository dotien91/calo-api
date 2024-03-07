import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { ReferralBonusType, ReferralRefType, ReferralType } from "../interfaces/referral.interface.i";

export type ReferralDocument = Referral & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Referral {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
  })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "User",
  })
  from_user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: ReferralType,
  })
  type: ReferralType;

  @Prop({
    type: String,
    enum: ReferralBonusType,
  })
  bonus_type: ReferralBonusType;

  @Prop({
    type: MongooseSchema.Types.Number,
  })
  bonus_value: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    nullable: true,
    refPath: "ref_type",
  })
  ref_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    nullable: true,
    enum: ReferralRefType,
  })
  ref_type: ReferralRefType;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);
