import { Injectable } from "@nestjs/common";
import { GoogleGenAI } from "@google/genai";
import { ICalorieAnalysis } from "../interfaces/calorie.interface";
import { QuotaManager } from "./quota.manager";

@Injectable()
export class CalorieService {
  private client: GoogleGenAI;
  private quotaManager: QuotaManager;

  constructor() {
    // Khởi tạo client theo SDK mới
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    this.quotaManager = new QuotaManager();
  }



  /**
   * @author Tony Vu
   * @param file
   * @param country
   * @returns
   */
  async analyzeFoodImage(file: Express.Multer.File, country?: string): Promise<ICalorieAnalysis> {
    // Lấy model còn quota
    const model = this.quotaManager.getAvailableModel();
    
    if (!model) {
      throw new Error("Tất cả các model đã hết quota trong ngày. Vui lòng thử lại vào ngày mai.");
    }

    try {
      // Gọi model với quota management
      const response = await this.client.models.generateContent({
        model: model,
        contents: [
          {
            role: "user",
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
        // Ép kiểu trả về là JSON để không cần helper parse thủ công
        config: {
            responseMimeType: "application/json"
        }
      });

      // Tăng counter sau khi gọi thành công
      this.quotaManager.incrementUsage(model);

      // SDK mới trả về kết quả trực tiếp qua thuộc tính .value (hoặc xử lý tùy phiên bản)
      // Thường response.text sẽ trả về chuỗi JSON sạch
      return JSON.parse(response.text);
    } catch (e) {
      // Nếu lỗi 429 (rate limit) thì đánh dấu model exhausted
      if (e.message?.includes('429') || (e as any).status === 429) {
        this.quotaManager.markAsExhausted(model);
        console.error(`[Gemini Error] Model ${model} exhausted:`, e.message);
      } else {
        console.error(`[Gemini Error] Model ${model}:`, e.message);
      }
      
      // Thử lại với model khác nếu có
      const nextModel = this.quotaManager.getAvailableModel();
      if (nextModel && nextModel !== model) {
        console.log(`[Quota] Retrying with model: ${nextModel}`);
        return this.analyzeFoodImage(file, country);
      }
      
      return null;
    }
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
}
