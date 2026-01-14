import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CalorieService } from "../services/calorie.service";

@Controller("calorie")
export class CalorieController {
  constructor(private readonly calorieService: CalorieService) {}

  /**
   * @author Tony Vu
   * @param file 
   * @returns 
   */
  @Post("analyze")
  @UseInterceptors(FileInterceptor("image"))
  async analyze(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Vui lòng gửi kèm hình ảnh món ăn.");
    }
    
    const result = await this.calorieService.analyzeFoodImage(file);
    
    if (!result) {
      throw new BadRequestException("AI không thể phân tích hình ảnh này.");
    }

    return result;
  }
}
