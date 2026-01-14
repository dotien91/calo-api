import {
  BadRequestException,
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

      const result = await this.calorieAnalysisService.findByUserId(
        userObject._id.toString(),
        page,
        limit
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
