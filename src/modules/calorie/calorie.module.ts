import { Module } from "@nestjs/common";
import { CalorieController } from "./controllers/calorie.controller";
import { CalorieService } from "./services/calorie.service";

@Module({
  controllers: [CalorieController],
  providers: [CalorieService],
  exports: [CalorieService],
})
export class CalorieModule {}
