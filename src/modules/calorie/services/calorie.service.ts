import { Injectable } from "@nestjs/common";
import { GoogleGenAI } from "@google/genai";
import { ICalorieAnalysis } from "../interfaces/calorie.interface";
import { ACTIVITY_MULTIPLIERS, PACE_CALORIES } from "../constants/calorie.constants";
import { Gender, WeightGoalPace } from "../enums/calorie.enum";
import { OnboardingDto } from "../dto/onboarding.dto";

const GEMINI_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'] as const;

@Injectable()
export class CalorieService {
  private client: GoogleGenAI;
  /** Sau khi A lỗi phải dùng B thì lần sau ưu tiên gọi B trước */
  private preferSecondModel = false;

  constructor() {
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  /**
   * @author Tony Vu
   * Gọi A, lỗi thì B. Lần sau ưu tiên gọi B trước.
   */
  async analyzeFoodImage(file: Express.Multer.File, country?: string): Promise<ICalorieAnalysis> {
    const models = process.env.GEMINI_MODEL
      ? [process.env.GEMINI_MODEL]
      : this.preferSecondModel
        ? [GEMINI_MODELS[1], GEMINI_MODELS[0]]
        : [...GEMINI_MODELS];

    const payload = {
      contents: [
        {
          role: "user" as const,
          parts: [
            { text: this.getDinhDuongPrompt(country) },
            {
              inlineData: {
                data: file.buffer.toString("base64"),
                mimeType: file.mimetype,
              },
            },
          ],
        },
      ],
      config: { responseMimeType: "application/json" as const },
    };

    let isFirstModel = true;
    for (const model of models) {
      try {
        const response = await this.client.models.generateContent({ model, ...payload });
        if (isFirstModel) this.preferSecondModel = model !== GEMINI_MODELS[0];
        return JSON.parse(response.text);
      } catch (e) {
        const err = e as any;
        console.warn(`[Gemini] model=${model}`, err?.message ?? err);
        if (isFirstModel) this.preferSecondModel = true;
        isFirstModel = false;
      }
    }
    return null;
  }

  /**
   * @author Tony Vu
   * @param country - Quốc gia (Việt Nam, Nhật Bản, Ý, Hàn Quốc, v.v.)
   * @returns Prompt string tối ưu logic phân tích quốc tế
   */
  private getDinhDuongPrompt(country?: string): string {
    const countryContext = country 
      ? `Cấu hình quốc gia/loại hình ẩm thực: ${country}.` 
      : `Tự động nhận diện quốc gia và phong cách ẩm thực qua hình ảnh (đặc điểm nguyên liệu, cách bày trí, vật dụng ăn uống đi kèm) để áp dụng định mức calo tương ứng.`;

    return `
      Hệ thống phân tích dinh dưỡng thực phẩm quốc tế.
      ${countryContext}

      LOGIC CHẤM ĐIỂM HEALTHY (/10):
      - Điểm cao (8-10): Ưu tiên thực phẩm tươi sống (sushi), đồ hấp/luộc, nhiều rau xanh, đạm nạc, ít nước sốt công nghiệp.
      - Điểm trung bình (5-7): Thực phẩm có sự cân bằng nhưng chứa tinh bột tinh luyện hoặc gia vị đặc trưng quốc gia.
      - Điểm thấp (<5): Thực phẩm siêu chế biến, đồ chiên rán sâu (fast food), nhiều phô mai, bơ béo, hoặc lượng muối/đường cực cao.

      QUY TẮC PHÂN TÍCH THÀNH PHẦN:
      - Bóc tách chi tiết theo cấu trúc món ăn: 
        + Món nước: Tách riêng sợi/bánh, nước dùng, và các loại thịt/protein.
        + Món khô: Tách riêng phần tinh bột chính, thức ăn kèm và nước sốt.
      - Ước lượng khối lượng: Dựa vào vật tham chiếu trong ảnh (đũa, thìa, dĩa, hoặc kích thước đĩa tiêu chuẩn).

      OUTPUT JSON (TRẢ VỀ DUY NHẤT JSON):
      {
        "food_name": string,
        "health_score": number,
        "health_reason": string,
        "total_weight": number,
        "total_calories": number,
        "total_carbs": number,
        "total_protein": number,
        "total_fat": number,
        "ingredients": [
          { 
            "name": string, 
            "weight": number, 
            "unit": "g" | "ml", 
            "calories": number, 
            "carbs": number, 
            "protein": number, 
            "fat": number 
          }
        ]
      }
    `;
  }

  /**
   * @author Tony Vu
   * Tính toán kế hoạch calorie dựa trên thông tin onboarding
   * @param dto
   * @returns
   */
  calculateOnboardingPlan(dto: OnboardingDto) {
    // 1. Tính BMR (Mifflin-St Jeor Equation - Công thức chuẩn nhất hiện nay)
    let bmr = (10 * dto.currentWeight) + (6.25 * dto.height) - (5 * dto.age);
    bmr += dto.gender === Gender.MALE ? 5 : -161;

    // 2. Tính TDEE (Tổng năng lượng tiêu hao mỗi ngày)
    const multiplier = ACTIVITY_MULTIPLIERS[dto.activityLevel];
    const tdee = Math.round(bmr * multiplier);

    // 3. Tính Daily Calorie Target (Mục tiêu calo mỗi ngày)
    const isGaining = dto.targetWeight > dto.currentWeight;
    const adjustment = PACE_CALORIES[dto.pace];
    
    // Nếu tăng cân thì cộng thêm, giảm cân thì trừ đi
    const dailyCalories = isGaining ? tdee + adjustment : tdee - adjustment;

    // 4. Tính Ngày hoàn thành (Estimated Completion Date)
    const weightDiff = Math.abs(dto.targetWeight - dto.currentWeight);
    const weeklyChangeRate = dto.pace === WeightGoalPace.SLOW ? 0.25 : 
                             dto.pace === WeightGoalPace.NORMAL ? 0.5 : 1.0;
    
    const weeksNeeded = weightDiff / weeklyChangeRate;
    const daysNeeded = Math.round(weeksNeeded * 7);

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysNeeded);

    // 5. Chia Macros (Tỷ lệ 50% Carb - 20% Protein - 30% Fat)
    const macros = {
      carbs_g: Math.round((dailyCalories * 0.5) / 4),    // 1g Carb = 4kcal
      protein_g: Math.round((dailyCalories * 0.2) / 4),  // 1g Protein = 4kcal
      fat_g: Math.round((dailyCalories * 0.3) / 9),      // 1g Fat = 9kcal
    };

    return {
      bmr,
      tdee,
      daily_calories: Math.round(dailyCalories),
      target_weight: dto.targetWeight,
      weeks_to_goal: Math.round(weeksNeeded * 10) / 10, // Làm tròn 1 số thập phân
      estimated_date: estimatedDate.toISOString().split('T')[0], // Trả về dạng YYYY-MM-DD
      macros
    };
  }

  /**
   * Calculate health score based on macro ratios (extracted from controller)
   */
  calculateHealthScore(
    calories: number,
    protein: number,
    carbs: number,
    fat: number
  ): { score: number; reason: string } {
    const proteinCalories = protein * 4;
    const carbsCalories = carbs * 4;
    const fatCalories = fat * 9;

    const proteinPercent = (proteinCalories / calories) * 100;
    const carbsPercent = (carbsCalories / calories) * 100;
    const fatPercent = (fatCalories / calories) * 100;

    let score = 5;
    let reason = "";

    if (proteinPercent >= 25 && fatPercent <= 35 && carbsPercent <= 60) {
      score = 8;
      reason = "Tỷ lệ dinh dưỡng cân bằng, protein cao, chất béo vừa phải";
    } else if (proteinPercent >= 20 && fatPercent <= 40 && carbsPercent <= 65) {
      score = 7;
      reason = "Tỷ lệ dinh dưỡng khá cân bằng";
    } else if (proteinPercent >= 15 && fatPercent <= 45) {
      score = 6;
      reason = "Tỷ lệ dinh dưỡng ở mức chấp nhận được";
    } else if (fatPercent > 45) {
      score = 4;
      reason = "Hàm lượng chất béo cao";
    } else if (proteinPercent < 15) {
      score = 4;
      reason = "Hàm lượng protein thấp";
    } else {
      score = 5;
      reason = "Tỷ lệ dinh dưỡng trung bình";
    }

    return { score, reason };
  }
}
