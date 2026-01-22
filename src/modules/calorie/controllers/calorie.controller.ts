import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
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
import { CreateManualCalorieDto } from "../dto/create-manual-calorie.dto";
import { OnboardingDto } from "../dto/onboarding.dto";
import { Onboarding } from "../schemas/onboarding.schema";
import { CalorieAnalysisService } from "../services/calorie_analysis.service";
import { CalorieService } from "../services/calorie.service";
import { OnboardingService } from "../services/onboarding.service";

@Controller("calorie")
export class CalorieController {
  constructor(
    private readonly calorieService: CalorieService,
    private readonly calorieAnalysisService: CalorieAnalysisService,
    private readonly onboardingService: OnboardingService
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
    @Res() res: Response,
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
      const savedAnalysis = await this.calorieAnalysisService.createFromImage(
        userObject._id.toString(),
        file,
        country
      );

      return res.status(HttpStatus.OK).json(savedAnalysis);
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
  async createManual(@Body() body: CreateManualCalorieDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }

      const savedAnalysis = await this.calorieAnalysisService.createFromManual(
        userObject._id.toString(),
        body
      );

      return res.status(HttpStatus.OK).json(savedAnalysis);
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
  // Health score calculation moved to CalorieService

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
  async delete(@Param("id") id: string, @Res() res: Response) {
    try {
      const deleted = await this.calorieAnalysisService.delete(id);
      if (!deleted) {
        throw new BadRequestException("Không thể xóa phân tích calorie này.");
      }

      return res.status(HttpStatus.OK).json({ success: true });
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
  async getStats(@Req() req: ExpressRequestDto, @Query() query: any, @Res() res: Response) {
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

      return res.status(HttpStatus.OK).json(stats);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * Onboarding - Tính toán và lưu kế hoạch calorie vào bảng onboarding
   * @param body
   * @param req
   * @returns
   */
  @Post("onboarding")
  async onboarding(@Body() body: OnboardingDto, @Req() req: ExpressRequestDto, @Res() res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }

      // Tính toán kế hoạch calorie
      const plan = this.calorieService.calculateOnboardingPlan(body);

      // Chuẩn bị data để lưu vào bảng onboarding
      const dataToSave = {
        gender: body.gender,
        age: body.age,
        height: body.height,
        current_weight: body.currentWeight,
        target_weight: body.targetWeight,
        activity_level: body.activityLevel,
        weight_goal_pace: body.pace,
        bmr: plan.bmr,
        tdee: plan.tdee,
        target_calories: plan.daily_calories,
        target_protein: plan.macros.protein_g,
        target_carbs: plan.macros.carbs_g,
        target_fat: plan.macros.fat_g,
        weeks_to_goal: plan.weeks_to_goal,
        estimated_completion_date: new Date(plan.estimated_date),
      };

      // Lưu hoặc cập nhật onboarding (upsert)
      const onboarding = await this.onboardingService.createOrUpdate(
        userObject._id.toString(),
        dataToSave
      );

      return res.status(HttpStatus.OK).json({
        onboarding: onboarding,
        plan: plan,
      });
    } catch (error) {
      throw new BadRequestException(error.message || "Có lỗi xảy ra khi onboarding.");
    }
  }

  /**
   * @author Tony Vu
   * Lấy thông tin onboarding của user
   * @param req
   * @returns
   */
  @Get("onboarding")
  async getOnboarding(@Req() req: ExpressRequestDto, @Res() res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }

      const onboarding = await this.onboardingService.findByUserId(userObject._id.toString());

      if (!onboarding) {
        throw new BadRequestException("Chưa có thông tin onboarding. Vui lòng thực hiện onboarding trước.");
      }

      return res.status(HttpStatus.OK).json(onboarding);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * Cập nhật một số thông tin onboarding của user (diet_type, target_steps, target_water, etc.)
   * @param body
   * @param req
   * @returns
   */
  @Patch("onboarding")
  async updateOnboarding(@Body() body: Partial<Onboarding>, @Req() req: ExpressRequestDto, @Res() res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }

      // Chỉ cho phép cập nhật một số trường cụ thể
      const allowedFields = [
        'diet_type',
        'target_steps',
        'target_water',
        'target_weight',
        'current_weight',
        'activity_level',
        'weight_goal_pace'
      ];

      const updateData: any = {};
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        throw new BadRequestException("Không có dữ liệu để cập nhật.");
      }

      const updatedOnboarding = await this.onboardingService.update(
        userObject._id.toString(),
        updateData
      );

      if (!updatedOnboarding) {
        throw new BadRequestException("Bạn chưa có hồ sơ sức khỏe (Onboarding). Vui lòng cập nhật thông tin cơ bản trước khi đặt mục tiêu.");
      }

      return res.status(HttpStatus.OK).json(updatedOnboarding);
    } catch (error) {
      throw new BadRequestException(error.message || "Có lỗi xảy ra khi cập nhật onboarding.");
    }
  }

  /**
   * @author Tony Vu
   * Lấy danh sách và tổng lượng calo tiêu thụ trong ngày hôm nay
   * @param req
   * @returns
   */
  @Get("today")
  async getTodayConsumption(@Req() req: ExpressRequestDto, @Res() res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException("User is invalid");
      }

      const today = new Date();
      const result = await this.calorieAnalysisService.getDailyConsumption(
        userObject._id.toString(),
        today
      );

      return res
        .set({
          "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count",
        })
        .status(HttpStatus.OK)
        .json(result);
    } catch (error) {
      throw new BadRequestException(
        error.message || "Có lỗi xảy ra khi lấy dữ liệu hôm nay."
      );
    }
  }

  /**
   * @author Tony Vu
   * Lấy danh sách và tổng lượng calo tiêu thụ cho ngày được chọn
   * @param req
   * @param date (query) - ISO date string or YYYY-MM-DD
   */
  @Get("day")
  async getDayConsumption(@Req() req: ExpressRequestDto, @Query('date') dateStr: string, @Res() res: Response) {
    try {
      const userObject = req?.user_object;
      if (!userObject) {
        throw new BadRequestException('User is invalid');
      }

      const date = dateStr ? new Date(dateStr) : new Date();
      if (isNaN(date.getTime())) {
        throw new BadRequestException('date is invalid');
      }

      // Return consumption for each day in the week containing the given date
      const weekResult = await this.calorieAnalysisService.getWeeklyConsumption(
        userObject._id.toString(),
        date
      );

      return res
        .set({ 'Access-Control-Expose-Headers': 'X-Authorization, X-Total-Count' })
        .status(HttpStatus.OK)
        .json({ week: weekResult });
    } catch (error) {
      throw new BadRequestException(error.message || 'Có lỗi xảy ra khi lấy dữ liệu theo ngày.');
    }
  }
}
