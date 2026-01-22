import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CalorieAnalysis, CalorieAnalysisDocument } from "../schemas/calorie_analysis.schema";
import { ICalorieAnalysis } from "../interfaces/calorie.interface";
import { CloudinaryService } from "../../media/services/cloudinary.service";
import { CalorieService } from "./calorie.service";

@Injectable()
export class CalorieAnalysisService {
  constructor(
    @InjectModel(CalorieAnalysis.name)
    private calorieAnalysisModel: Model<CalorieAnalysisDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly calorieService: CalorieService
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
    imageUrl?: string
  ): Promise<CalorieAnalysisDocument> {
    const dataToCreate: any = {
      user_id: new Types.ObjectId(userId),
      food_name: analysisData.food_name,
      health_score: analysisData.health_score || 5, // Default health_score nếu không có
      health_reason: analysisData.health_reason || "",
      total_weight: analysisData.total_weight,
      total_calories: analysisData.total_calories,
      total_carbs: analysisData.total_carbs,
      total_protein: analysisData.total_protein,
      total_fat: analysisData.total_fat,
      ingredients: analysisData.ingredients || [],
    };

    // Chỉ thêm image_url nếu có
    if (imageUrl) {
      dataToCreate.image_url = imageUrl;
    }

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
   * Update image_url for an existing analysis
   * @param id
   * @param imageUrl
   * @returns
   */
  async updateImageUrl(id: string, imageUrl: string): Promise<CalorieAnalysisDocument> {
    if (!id) {
      throw new Error("Id phân tích calorie không hợp lệ.");
    }
    if (!imageUrl) {
      throw new Error("Image URL không hợp lệ.");
    }

    const updated = await this.calorieAnalysisModel
      .findByIdAndUpdate(id, { image_url: imageUrl }, { new: true })
      .exec();

    if (!updated) {
      throw new Error("Không tìm thấy phân tích calorie này.");
    }

    return updated;
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

  /**
   * @author Tony Vu
   * @param userId
   * @param date Input date (YYYY-MM-DD string or Date object)
   * @returns
   */
  async getDailyConsumption(
    userId: string,
    date: Date
  ): Promise<{
    records: CalorieAnalysisDocument[];
    totals: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      meals: number;
    };
  }> {
    // 1. Parse input date & Force UTC calculation
    const d = new Date(date);
    
    // Tạo mốc bắt đầu ngày: 00:00:00.000 UTC
    const startOfDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
    
    // Tạo mốc kết thúc ngày: 23:59:59.999 UTC
    const endOfDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));

    const records = await this.calorieAnalysisModel
      .find({
        user_id: new Types.ObjectId(userId),
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .sort({ createdAt: -1 })
      .exec();

    const totals = records.reduce(
      (acc, record) => {
        acc.calories += record.total_calories || 0;
        acc.protein += record.total_protein || 0;
        acc.carbs += record.total_carbs || 0;
        acc.fat += record.total_fat || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, meals: records.length }
    );

    return { records, totals };
  }

  /**
   * Get consumption totals for each day of the week containing the provided date.
   * Week starts on Monday.
   * Returns array of 7 items: { date: 'YYYY-MM-DD', records, totals }
   */
  async getWeeklyConsumption(userId: string, date: Date): Promise<Array<any>> {
    // 1. Chuẩn hóa input về UTC
    const inputDate = new Date(date);
    // Lấy ngày chuẩn UTC (bỏ qua giờ)
    const currentDayUTC = new Date(Date.UTC(inputDate.getUTCFullYear(), inputDate.getUTCMonth(), inputDate.getUTCDate()));

    // 2. Tính toán ngày Thứ 2 đầu tuần (Dựa trên getUTCDay để không bị lệch múi giờ)
    // getUTCDay: 0 (CN) -> 6 (T7). Cần map về: 0 (T2) ... 6 (CN)
    const dayOfWeek = (currentDayUTC.getUTCDay() + 6) % 7; 
    
    // Lùi về ngày Thứ 2
    const startOfWeek = new Date(currentDayUTC);
    startOfWeek.setUTCDate(currentDayUTC.getUTCDate() - dayOfWeek);

    const results: Array<any> = [];

    // Loop 7 ngày từ Thứ 2 -> CN
    for (let i = 0; i < 7; i++) {
      // Tạo ngày i dựa trên startOfWeek
      const d = new Date(startOfWeek);
      d.setUTCDate(startOfWeek.getUTCDate() + i);

      // Tạo range query UTC chuẩn xác cho MongoDB
      const startOfDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));

      const records = await this.calorieAnalysisModel
        .find({
          user_id: new Types.ObjectId(userId),
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        })
        .sort({ createdAt: -1 })
        .exec();

      const totals = records.reduce(
        (acc, record) => {
          acc.calories += record.total_calories || 0;
          acc.protein += record.total_protein || 0;
          acc.carbs += record.total_carbs || 0;
          acc.fat += record.total_fat || 0;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0, meals: records.length }
      );

      results.push({
        // Trả về string YYYY-MM-DD đúng ngày đó
        date: startOfDay.toISOString().slice(0, 10),
        records,
        totals,
      });
    }

    return results;
  }

  /**
   * Create analysis from uploaded image: upload, analyze and save
   */
  async createFromImage(userId: string, file: Express.Multer.File, country?: string) {
    const uploadResult = await this.cloudinaryService.uploadFoodImage(file);

    const analysisResult: ICalorieAnalysis = await this.calorieService.analyzeFoodImage(file, country);
    if (!analysisResult) {
      throw new Error("AI không thể phân tích hình ảnh này.");
    }

    const saved = await this.create(userId, analysisResult, uploadResult?.secure_url);
    return saved;
  }

  /**
   * Create analysis from manual payload (calculate health score then save)
   */
  async createFromManual(userId: string, body: any) {
    // try to use calorieService's health score logic if available
    const healthScore = this.calorieService.calculateHealthScore(
      body.total_calories,
      body.total_protein,
      body.total_carbs,
      body.total_fat
    );

    const analysisData: ICalorieAnalysis = {
      food_name: body.food_name || 'Bữa ăn thủ công',
      health_score: healthScore.score,
      health_reason: healthScore.reason,
      total_weight: body.total_weight,
      total_calories: body.total_calories,
      total_carbs: body.total_carbs,
      total_protein: body.total_protein,
      total_fat: body.total_fat,
      ingredients: body.ingredients || [],
    };

    const saved = await this.create(userId, analysisData);
    return saved;
  }
}