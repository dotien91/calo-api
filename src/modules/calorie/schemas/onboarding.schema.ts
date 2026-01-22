import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export enum DietType {
  BALANCED = 'BALANCED',
  LOW_CARB = 'LOW_CARB',
  LOW_FAT = 'LOW_FAT',
  HIGH_PROTEIN = 'HIGH_PROTEIN',
  KETO = 'KETO',
  VEGETARIAN = 'VEGETARIAN',
}

export type OnboardingDocument = Onboarding & Document;

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class Onboarding {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true, required: true, unique: true })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  gender: string; // MALE hoặc FEMALE

  @Prop({
    type: Number,
    required: true,
  })
  age: number; // Tuổi

  @Prop({
    type: Number,
    required: true,
  })
  height: number; // Chiều cao (cm)

  @Prop({
    type: Number,
    required: true,
  })
  current_weight: number; // Cân nặng hiện tại (kg)

  @Prop({
    type: Number,
    required: true,
  })
  target_weight: number; // Cân nặng mục tiêu (kg)

  @Prop({
    type: String,
    required: true,
  })
  activity_level: string; // SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE, EXTREMELY_ACTIVE

  @Prop({
    type: String,
    required: true,
  })
  weight_goal_pace: string; // SLOW, NORMAL, FAST

  @Prop({
    type: Number,
    required: true,
  })
  bmr: number; // Basal Metabolic Rate (kcal)

  @Prop({
    type: Number,
    required: true,
  })
  tdee: number; // Total Daily Energy Expenditure (kcal)

  @Prop({
    type: Number,
    required: true,
  })
  target_calories: number; // Calo mục tiêu (kcal)

  @Prop({
    type: Number,
    required: true,
  })
  target_protein: number; // Protein mục tiêu (g)

  @Prop({
    type: Number,
    required: true,
  })
  target_carbs: number; // Carbs mục tiêu (g)

  @Prop({
    type: Number,
    required: true,
  })
  target_fat: number; // Fat mục tiêu (g)

  @Prop({
    type: String,
    enum: DietType,
    default: null,
  })
  diet_type: DietType; // Chế độ ăn (enum: BALANCED, LOW_CARB, LOW_FAT, HIGH_PROTEIN, KETO, VEGETARIAN)

  @Prop({
    type: Number,
    default: null,
  })
  target_steps: number; // Bước chân mục tiêu (bước)

  @Prop({
    type: Number,
    default: null,
  })
  target_water: number; // Nước mục tiêu (ml)

  @Prop({
    type: Number,
    required: true,
  })
  weeks_to_goal: number; // Số tuần để đạt mục tiêu

  @Prop({
    type: Date,
    required: true,
  })
  estimated_completion_date: Date; // Ngày dự kiến hoàn thành mục tiêu
}

export const OnboardingSchema = SchemaFactory.createForClass(Onboarding);
