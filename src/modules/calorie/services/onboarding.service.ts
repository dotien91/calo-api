import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Onboarding, OnboardingDocument } from "../schemas/onboarding.schema";

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(Onboarding.name)
    private onboardingModel: Model<OnboardingDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param userId
   * @param data
   * @returns
   */
  async createOrUpdate(userId: string, data: any): Promise<OnboardingDocument> {
    const dataToSave = {
      user_id: new Types.ObjectId(userId),
      gender: data.gender,
      age: data.age,
      height: data.height,
      current_weight: data.current_weight,
      target_weight: data.target_weight,
      activity_level: data.activity_level,
      weight_goal_pace: data.weight_goal_pace,
      bmr: data.bmr,
      tdee: data.tdee,
      target_calories: data.target_calories,
      target_protein: data.target_protein,
      target_carbs: data.target_carbs,
      target_fat: data.target_fat,
      diet_type: data.diet_type || null,
      target_steps: data.target_steps || null,
      target_water: data.target_water || null,
      weeks_to_goal: data.weeks_to_goal,
      estimated_completion_date: data.estimated_completion_date,
    };

    return await this.onboardingModel.findOneAndUpdate(
      { user_id: new Types.ObjectId(userId) },
      dataToSave,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();
  }

  /**
   * @author Tony Vu
   * @param userId
   * @returns
   */
  async findByUserId(userId: string): Promise<OnboardingDocument> {
    return await this.onboardingModel.findOne({ user_id: new Types.ObjectId(userId) }).exec();
  }

  /**
   * @author Tony Vu
   * @param userId
   * @param data
   * @returns
   */
  async update(userId: string, data: Partial<Onboarding>): Promise<OnboardingDocument> {
    return await this.onboardingModel.findOneAndUpdate(
      { user_id: new Types.ObjectId(userId) },
      { $set: data },
      { new: true }
    ).exec();
  }
}
