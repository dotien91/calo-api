import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CloudinaryService } from "../../media/services/cloudinary.service";
import { CreateManualCalorieDto } from "../dto/create-manual-calorie.dto";
import { CalorieAnalysisService } from "../services/calorie_analysis.service";
import { CalorieService } from "../services/calorie.service";

@Controller("calorie")
export class CalorieController {
  constructor(
    private readonly calorieService: CalorieService,
    private readonly calorieAnalysisService: CalorieAnalysisService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  /**
   * @author Tony Vu
   * Phân tích và lưu kết quả calorie
   * @param file 
   * @param req 
   * @returns 
   */
  @Post("analyze")
  @UseInterceptors(FileInterceptor("image"))
  async analyze(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: ExpressRequestDto,
    @Query("country") country?: string
  ) {
    if (!file) {
      throw new BadRequestException("Vui lòng gửi kèm hình ảnh món ăn.");
    }

    const userObject = req?.user_object;
    if (!userObject) {
      throw new BadRequestException("User is invalid");
    }

    try {
      // 1. Upload ảnh lên Cloudinary
      const uploadResult = await this.cloudinaryService.uploadFoodImage(file);

      // 2. Phân tích ảnh bằng AI với country context (nếu có)
      const analysisResult = await this.calorieService.analyzeFoodImage(file, country);

      if (!analysisResult) {
        throw new BadRequestException("AI không thể phân tích hình ảnh này.");
      }

      // 3. Lưu kết quả vào database
      const savedAnalysis = await this.calorieAnalysisService.create(
        userObject._id.toString(),
        analysisResult,
        uploadResult.secure_url
      );

      return {
        success: true,
        message: "Phân tích calorie thành công",
        data: savedAnalysis,
      };
    } catch (error) {
      throw new BadRequestException(error.message || "Có lỗi xảy ra khi phân tích calorie.");
    }
  }

  /**
   * @author Tony Vu
   * Nhập thủ công các thông số calorie (chỉ cần các thông số dinh dưỡng)
   * @param body
   * @param req
   * @returns
   */
  @Post("manual")
  async createManual(@Body() body: CreateManualCalorieDto, @Req() req: ExpressRequestDto) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }

      // Tính toán health_score dựa trên tỷ lệ dinh dưỡng
      const healthScore = this.calculateHealthScore(
        body.total_calories,
        body.total_protein,
        body.total_carbs,
        body.total_fat
      );

      // Chuyển đổi DTO thành ICalorieAnalysis format với các giá trị mặc định
      const analysisData = {
        food_name: "Bữa ăn thủ công",
        health_score: healthScore.score,
        health_reason: healthScore.reason,
        total_weight: body.total_weight,
        total_calories: body.total_calories,
        total_carbs: body.total_carbs,
        total_protein: body.total_protein,
        total_fat: body.total_fat,
        ingredients: [],
      };

      // Lưu vào database (không có image_url)
      const savedAnalysis = await this.calorieAnalysisService.create(
        userObject._id.toString(),
        analysisData
      );

      return {
        success: true,
        message: "Nhập calorie thủ công thành công",
        data: savedAnalysis,
      };
    } catch (error) {
      throw new BadRequestException(error.message || "Có lỗi xảy ra khi nhập calorie thủ công.");
    }
  }

  /**
   * @author Tony Vu
   * Tính toán health_score dựa trên tỷ lệ dinh dưỡng
   * @param calories
   * @param protein
   * @param carbs
   * @param fat
   * @returns
   */
  private calculateHealthScore(
    calories: number,
    protein: number,
    carbs: number,
    fat: number
  ): { score: number; reason: string } {
    // Tính tỷ lệ % của từng chất dinh dưỡng
    const proteinCalories = protein * 4;
    const carbsCalories = carbs * 4;
    const fatCalories = fat * 9;

    const proteinPercent = (proteinCalories / calories) * 100;
    const carbsPercent = (carbsCalories / calories) * 100;
    const fatPercent = (fatCalories / calories) * 100;

    let score = 5; // Điểm mặc định
    let reason = "";

    // Logic đánh giá:
    // - Protein cao (>25%) -> tốt
    // - Fat vừa phải (20-35%) -> tốt
    // - Carbs không quá cao (<60%) -> tốt
    // - Fat quá cao (>40%) -> không tốt
    // - Protein quá thấp (<15%) -> không tốt

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

  /**
   * @author Tony Vu
   * Lấy danh sách calorie analysis của user
   * @param req 
   * @param query 
   * @param res 
   * @returns 
   */
  @Get("list")
  async getList(@Req() req: ExpressRequestDto, @Query() query: any, @Res() res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }

      const page = Number(query?.page) || 1;
      const limit = Number(query?.limit) || 20;
      
      // Parse date filter từ query params
      const dateFrom = query?.date_from || query?.from ? new Date(query.date_from || query.from) : undefined;
      const dateTo = query?.date_to || query?.to ? new Date(query.date_to || query.to) : undefined;

      // Validate dates
      if (dateFrom && isNaN(dateFrom.getTime())) {
        throw new BadRequestException("date_from không hợp lệ");
      }
      if (dateTo && isNaN(dateTo.getTime())) {
        throw new BadRequestException("date_to không hợp lệ");
      }

      const result = await this.calorieAnalysisService.findByUserId(
        userObject._id.toString(),
        page,
        limit,
        dateFrom,
        dateTo
      );

      return res
        .header("Access-Control-Expose-Headers", "X-Authorization, X-Total-Count")
        .header("X-Total-Count", result.total.toString())
        .status(HttpStatus.OK)
        .json(result.data);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * Lấy chi tiết một calorie analysis
   * @param id 
   * @param res 
   * @returns 
   */
  @Get("detail/:id")
  async getDetail(@Param("id") id: string, @Res() res: Response) {
    try {
      const analysis = await this.calorieAnalysisService.findById(id);
      if (!analysis) {
        throw new BadRequestException("Không tìm thấy phân tích calorie này.");
      }

      return res.status(HttpStatus.OK).json(analysis);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * Xóa một calorie analysis
   * @param id 
   * @returns 
   */
  @Delete("delete/:id")
  async delete(@Param("id") id: string) {
    try {
      const deleted = await this.calorieAnalysisService.delete(id);
      if (!deleted) {
        throw new BadRequestException("Không thể xóa phân tích calorie này.");
      }

      return {
        success: true,
        message: "Xóa phân tích calorie thành công",
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * Lấy thống kê calorie của user
   * @param req 
   * @param query 
   * @returns 
   */
  @Get("stats")
  async getStats(@Req() req: ExpressRequestDto, @Query() query: any) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }

      const dateFrom = query?.date_from ? new Date(query.date_from) : undefined;
      const dateTo = query?.date_to ? new Date(query.date_to) : undefined;

      const stats = await this.calorieAnalysisService.getStatsByDateRange(
        userObject._id.toString(),
        dateFrom,
        dateTo
      );

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
