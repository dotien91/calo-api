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

    // Ưu tiên imageUrl từ tham số, nếu không có thì lấy từ analysisData.image_url
    const finalImageUrl = imageUrl || analysisData.image_url;
    if (finalImageUrl) {
      dataToCreate.image_url = finalImageUrl;
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
   * Phân tích lại bằng AI từ ảnh đã lưu (image_url). Body.user_edit_hint được truyền vào prompt để AI ưu tiên chỉnh theo ý user.
   */
  async reanalyze(
    id: string,
    userId: string,
    body?: { user_edit_hint?: string },
  ): Promise<CalorieAnalysisDocument> {
    const doc = await this.findById(id);
    if (!doc) {
      throw new Error("Không tìm thấy phân tích calorie này.");
    }
    if (doc.user_id.toString() !== userId) {
      throw new Error("Bạn không có quyền phân tích lại bản ghi này.");
    }
    if (!doc.image_url) {
      throw new Error("Bản ghi không có ảnh để phân tích lại.");
    }
    const analysisResult = await this.calorieService.analyzeFoodImageFromUrl(
      doc.image_url,
      undefined,
      body?.user_edit_hint,
    );
    if (!analysisResult) {
      throw new Error("AI không thể phân tích lại hình ảnh này.");
    }
    const normalizedIngredients = (analysisResult.ingredients || []).map(
      (i: any) => ({
        name: i?.name,
        weight: i?.weight,
        unit: i?.unit || "g",
        calories: i?.calories,
        carbs: i?.carbs,
        protein: i?.protein,
        fat: i?.fat,
      }),
    );
    const update: any = {
      food_name: analysisResult.food_name,
      health_score: analysisResult.health_score ?? doc.health_score,
      health_reason: analysisResult.health_reason ?? doc.health_reason,
      total_weight: analysisResult.total_weight,
      total_calories: analysisResult.total_calories,
      total_carbs: analysisResult.total_carbs,
      total_protein: analysisResult.total_protein,
      total_fat: analysisResult.total_fat,
      ingredients: normalizedIngredients,
    };
    const updated = await this.calorieAnalysisModel
      .findByIdAndUpdate(new Types.ObjectId(id), update, { new: true })
      .exec();
    return updated;
  }

  /**
   * Cập nhật calorie analysis (sửa kết quả). Chỉ user sở hữu bản ghi mới được sửa.
   */
  async update(
    id: string,
    userId: string,
    body: {
      food_name?: string;
      image_url?: string;
      total_weight?: number;
      total_calories?: number;
      total_carbs?: number;
      total_protein?: number;
      total_fat?: number;
      ingredients?: Array<{
        name: string;
        weight: number;
        unit?: string;
        calories: number;
        carbs: number;
        protein: number;
        fat: number;
      }>;
    },
  ): Promise<CalorieAnalysisDocument> {
    const doc = await this.findById(id);
    if (!doc) {
      throw new Error("Không tìm thấy phân tích calorie này.");
    }
    if (doc.user_id.toString() !== userId) {
      throw new Error("Bạn không có quyền sửa bản ghi này.");
    }

    const update: any = {};
    if (body.food_name !== undefined) update.food_name = body.food_name;
    if (body.image_url !== undefined) update.image_url = body.image_url;
    if (body.total_weight !== undefined) update.total_weight = body.total_weight;
    if (body.total_calories !== undefined) update.total_calories = body.total_calories;
    if (body.total_carbs !== undefined) update.total_carbs = body.total_carbs;
    if (body.total_protein !== undefined) update.total_protein = body.total_protein;
    if (body.total_fat !== undefined) update.total_fat = body.total_fat;

    if (
      body.total_calories !== undefined &&
      body.total_protein !== undefined &&
      body.total_carbs !== undefined &&
      body.total_fat !== undefined
    ) {
      const healthScore = this.calorieService.calculateHealthScore(
        body.total_calories,
        body.total_protein,
        body.total_carbs,
        body.total_fat,
      );
      update.health_score = healthScore.score;
      update.health_reason = healthScore.reason;
    }

    if (body.ingredients !== undefined) {
      update.ingredients = body.ingredients.map((i: any) => ({
        name: i?.name,
        weight: i?.weight,
        unit: i?.unit || "g",
        calories: i?.calories,
        carbs: i?.carbs,
        protein: i?.protein,
        fat: i?.fat,
      }));
    }

    const updated = await this.calorieAnalysisModel
      .findByIdAndUpdate(new Types.ObjectId(id), update, { new: true })
      .exec();
    return updated;
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

    const normalizedIngredients = (body.ingredients || []).map((i: any) => ({
      name: i?.name,
      weight: i?.weight,
      unit: i?.unit || "g",
      calories: i?.calories,
      carbs: i?.carbs,
      protein: i?.protein,
      fat: i?.fat,
    }));

    const analysisData: ICalorieAnalysis = {
      food_name: body.food_name || "Bữa ăn thủ công",
      health_score: healthScore.score,
      health_reason: healthScore.reason,
      total_weight: body.total_weight,
      total_calories: body.total_calories,
      total_carbs: body.total_carbs,
      total_protein: body.total_protein,
      total_fat: body.total_fat,
      ingredients: normalizedIngredients,
      image_url: body.image_url,
    };

    const saved = await this.create(userId, analysisData);
    return saved;
  }
}