import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CalorieAnalysis, CalorieAnalysisDocument } from "../schemas/calorie_analysis.schema";
import { ICalorieAnalysis } from "../interfaces/calorie.interface";

@Injectable()
export class CalorieAnalysisService {
  constructor(
    @InjectModel(CalorieAnalysis.name)
    private calorieAnalysisModel: Model<CalorieAnalysisDocument>
  ) {}

  /**
   * @author Tony Vu
   * @param userId
   * @param analysisData
   * @param imageUrl
   * @returns
   */
  async create(
    userId: string,
    analysisData: ICalorieAnalysis,
    imageUrl: string
  ): Promise<CalorieAnalysisDocument> {
    const dataToCreate = {
      user_id: new Types.ObjectId(userId),
      food_name: analysisData.food_name,
      health_score: analysisData.health_score,
      health_reason: analysisData.health_reason || "",
      total_weight: analysisData.total_weight,
      total_calories: analysisData.total_calories,
      total_carbs: analysisData.total_carbs,
      total_protein: analysisData.total_protein,
      total_fat: analysisData.total_fat,
      ingredients: analysisData.ingredients,
      image_url: imageUrl,
    };

    const created = new this.calorieAnalysisModel(dataToCreate);
    return await created.save();
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async findById(id: string): Promise<CalorieAnalysisDocument> {
    if (!id) {
      return null;
    }
    const objectId = new Types.ObjectId(id);
    return await this.calorieAnalysisModel.findById(objectId).exec();
  }

  /**
   * @author Tony Vu
   * @param userId
   * @param page
   * @param limit
   * @param dateFrom
   * @param dateTo
   * @returns
   */
  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<{ data: CalorieAnalysisDocument[]; total: number }> {
    const condition: any = { user_id: new Types.ObjectId(userId) };
    
    // Filter theo thời gian nếu có
    if (dateFrom || dateTo) {
      condition.createdAt = {};
      if (dateFrom) {
        condition.createdAt.$gte = dateFrom;
      }
      if (dateTo) {
        // Set time về cuối ngày (23:59:59.999)
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        condition.createdAt.$lte = endOfDay;
      }
    }
    
    const data = await this.calorieAnalysisModel
      .find(condition)
      .sort({ createdAt: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();

    const total = await this.calorieAnalysisModel.countDocuments(condition).exec();

    return { data, total };
  }

  /**
   * @author Tony Vu
   * @param id
   * @returns
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.calorieAnalysisModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      return false;
    }
  }

  /**
   * @author Tony Vu
   * @param userId
   * @param dateFrom
   * @param dateTo
   * @returns
   */
  async getStatsByDateRange(
    userId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<{
    totalCalories: number;
    totalMeals: number;
    averageHealthScore: number;
  }> {
    const condition: any = { user_id: new Types.ObjectId(userId) };
    
    if (dateFrom || dateTo) {
      condition.createdAt = {};
      if (dateFrom) condition.createdAt.$gte = dateFrom;
      if (dateTo) condition.createdAt.$lte = dateTo;
    }

    const analyses = await this.calorieAnalysisModel.find(condition).exec();
    
    const totalCalories = analyses.reduce((sum, item) => sum + item.total_calories, 0);
    const totalMeals = analyses.length;
    const averageHealthScore = totalMeals > 0
      ? analyses.reduce((sum, item) => sum + item.health_score, 0) / totalMeals
      : 0;

    return {
      totalCalories,
      totalMeals,
      averageHealthScore: Math.round(averageHealthScore * 10) / 10,
    };
  }
}
