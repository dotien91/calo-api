import { Injectable } from "@nestjs/common";
import { GoogleGenAI } from "@google/genai";
import { ICalorieAnalysis } from "../interfaces/calorie.interface";

@Injectable()
export class CalorieService {
  private client: GoogleGenAI;

  constructor() {
    // Khởi tạo client theo SDK mới
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  /**
   * @author Tony Vu
   * @param file
   * @returns
   */
  async analyzeFoodImage(file: Express.Multer.File): Promise<ICalorieAnalysis> {
    try {
      // Gọi model gemini-3-flash-preview
      const response = await this.client.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              { text: this.getDinhDuongPrompt() },
              {
                inlineData: {
                  data: file.buffer.toString("base64"),
                  mimeType: file.mimetype,
                },
              },
            ],
          },
        ],
        // Ép kiểu trả về là JSON để không cần helper parse thủ công
        config: {
            responseMimeType: "application/json"
        }
      });

      // SDK mới trả về kết quả trực tiếp qua thuộc tính .value (hoặc xử lý tùy phiên bản)
      // Thường response.text sẽ trả về chuỗi JSON sạch
      return JSON.parse(response.text);
    } catch (e) {
      console.error("[Gemini 3 Error]:", e.message);
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @returns
   */
  private getDinhDuongPrompt(): string {
    return `
      Phân tích ảnh món ăn Việt Nam này. Trả về JSON với các trường chính xác:
      food_name, health_score (1-10), total_weight (g), total_calories (kcal), 
      total_carbs (g), total_protein (g), total_fat (g),
      ingredients: [{ name, weight, unit, calories, carbs, protein, fat }]
      
      Lưu ý: Phân tích chi tiết bún, nước dùng, và các loại thịt như ảnh mẫu.
    `;
  }
}
