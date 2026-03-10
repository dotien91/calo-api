import { Injectable } from "@nestjs/common";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { ICalorieAnalysis } from "../interfaces/calorie.interface";
import { ACTIVITY_MULTIPLIERS, PACE_CALORIES } from "../constants/calorie.constants";
import { Gender, WeightGoalPace } from "../enums/calorie.enum";
import { OnboardingDto } from "../dto/onboarding.dto";

// =================================================================
// CẤU HÌNH MODEL: luân phiên 2 model, lỗi thì retry model kia; model thành công được đặt mặc định cho lần sau
// =================================================================
const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];

@Injectable()
export class CalorieService {
  private client: GoogleGenAI;
  /** Model mặc định sau khi có lần gọi thành công; null = chưa xác định, thử lần lượt theo MODELS */
  private preferredModel: string | null = null;

  constructor() {
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async analyzeFoodImage(
    file: Express.Multer.File,
    country?: string,
    userEditHint?: string,
  ): Promise<ICalorieAnalysis | null> {
    const modelOrder =
      this.preferredModel !== null
        ? [this.preferredModel, ...MODELS.filter((m) => m !== this.preferredModel)]
        : [...MODELS];

    const payload = {
      contents: [
        {
          role: "user" as const,
          parts: [
            { text: this.getDinhDuongPrompt(country, userEditHint) },
            {
              inlineData: {
                data: file.buffer.toString("base64"),
                mimeType: file.mimetype,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json" as const,
      },
    };

    for (const model of modelOrder) {
      try {
        const response = await this.client.models.generateContent({
          model,
          ...payload,
        });

        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          this.preferredModel = model;
          return parsed;
        }
      } catch (e) {
        const err = e as any;
        const errCode = err?.status || err?.error?.code || "UNKNOWN";
        const errMsg = err?.message || err?.error?.message || JSON.stringify(err);
        console.warn(`[Gemini Error] Model: ${model} | Code: ${errCode} | Message: ${errMsg}`);
      }
    }
    return null;
  }

  /**
   * Phân tích lại từ ảnh qua URL (dùng cho reanalyze – ảnh đã lưu trên Cloudinary).
   * userEditHint: gợi ý chỉnh sửa của user, được đưa vào prompt để AI ưu tiên điều chỉnh.
   */
  async analyzeFoodImageFromUrl(
    imageUrl: string,
    country?: string,
    userEditHint?: string,
  ): Promise<ICalorieAnalysis | null> {
    const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(res.data);
    const contentType = res.headers["content-type"];
    const mimeType =
      typeof contentType === "string" && contentType.split(";")[0].trim()
        ? contentType.split(";")[0].trim()
        : "image/jpeg";
    const fileLike: Express.Multer.File = {
      fieldname: "image",
      originalname: "image.jpg",
      encoding: "7bit",
      mimetype: mimeType,
      buffer,
      size: buffer.length,
    } as Express.Multer.File;
    return this.analyzeFoodImage(fileLike, country, userEditHint);
  }

  // --- CÁC HÀM BÊN DƯỚI GIỮ NGUYÊN ---

  private getDinhDuongPrompt(country?: string, userEditHint?: string): string {
    const countryContext = country 
      ? `Cấu hình quốc gia/loại hình ẩm thực: ${country}.` 
      : `Tự động nhận diện quốc gia và phong cách ẩm thực qua hình ảnh (đặc điểm nguyên liệu, cách bày trí, vật dụng ăn uống đi kèm) để áp dụng định mức calo tương ứng.`;

    const userHintBlock =
      userEditHint && userEditHint.trim()
        ? `
      QUAN TRỌNG - GỢI Ý CHỈNH SỬA CỦA NGƯỜI DÙNG (ưu tiên áp dụng khi phân tích):
      "${userEditHint.trim()}"
      Hãy điều chỉnh kết quả (tên món, thành phần, khối lượng, calo, macros) theo đúng gợi ý trên nếu hợp lý với hình ảnh.
      `
        : "";

    return `
      Hệ thống phân tích dinh dưỡng thực phẩm quốc tế.
      ${countryContext}
      ${userHintBlock}

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

  calculateOnboardingPlan(dto: OnboardingDto) {
    let bmr = (10 * dto.currentWeight) + (6.25 * dto.height) - (5 * dto.age);
    bmr += dto.gender === Gender.MALE ? 5 : -161;

    const multiplier = ACTIVITY_MULTIPLIERS[dto.activityLevel];
    const tdee = Math.round(bmr * multiplier);

    const isGaining = dto.targetWeight > dto.currentWeight;
    const adjustment = PACE_CALORIES[dto.pace];
    const dailyCalories = isGaining ? tdee + adjustment : tdee - adjustment;

    const weightDiff = Math.abs(dto.targetWeight - dto.currentWeight);
    const weeklyChangeRate = dto.pace === WeightGoalPace.SLOW ? 0.25 : 
                             dto.pace === WeightGoalPace.NORMAL ? 0.5 : 1.0;
    
    const weeksNeeded = weightDiff / weeklyChangeRate;
    const daysNeeded = Math.round(weeksNeeded * 7);

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysNeeded);

    const macros = {
      carbs_g: Math.round((dailyCalories * 0.5) / 4),
      protein_g: Math.round((dailyCalories * 0.2) / 4),
      fat_g: Math.round((dailyCalories * 0.3) / 9),
    };

    return {
      bmr,
      tdee,
      daily_calories: Math.round(dailyCalories),
      target_weight: dto.targetWeight,
      weeks_to_goal: Math.round(weeksNeeded * 10) / 10,
      estimated_date: estimatedDate.toISOString().split('T')[0],
      macros
    };
  }

  calculateHealthScore(
    calories: number,
    protein: number,
    carbs: number,
    fat: number
  ): { score: number; reason: string } {
    if (calories === 0) return { score: 10, reason: "Không có calo" };

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