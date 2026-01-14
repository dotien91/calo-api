import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type CalorieAnalysisDocument = CalorieAnalysis & Document;

@Schema()
export class Ingredient {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  weight: number;

  @Prop({ type: String, required: true, default: "g" })
  unit: string;

  @Prop({ type: Number, required: true })
  calories: number;

  @Prop({ type: Number, required: true })
  carbs: number;

  @Prop({ type: Number, required: true })
  protein: number;

  @Prop({ type: Number, required: true })
  fat: number;
}

export const IngredientSchema = SchemaFactory.createForClass(Ingredient);

@Schema({
  timestamps: {
    currentTime: () => Math.floor(Date.now()),
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
})
export class CalorieAnalysis {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    auto: true,
  })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", index: true, required: true })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  food_name: string;

  @Prop({ type: Number, required: true, min: 1, max: 10 })
  health_score: number;

  @Prop({ type: String })
  health_reason: string;

  @Prop({ type: Number, required: true })
  total_weight: number;

  @Prop({ type: Number, required: true })
  total_calories: number;

  @Prop({ type: Number, required: true })
  total_carbs: number;

  @Prop({ type: Number, required: true })
  total_protein: number;

  @Prop({ type: Number, required: true })
  total_fat: number;

  @Prop({ type: [IngredientSchema], default: [] })
  ingredients: Ingredient[];

  @Prop({ type: String })
  image_url: string;
}

export const CalorieAnalysisSchema = SchemaFactory.createForClass(CalorieAnalysis);
