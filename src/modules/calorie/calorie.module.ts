import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MediaModule } from "../media/media.module";
import { User, UserSchema } from "../user/schemas/user.schema";
import { CalorieController } from "./controllers/calorie.controller";
import { CalorieAnalysis, CalorieAnalysisSchema } from "./schemas/calorie_analysis.schema";
import { Onboarding, OnboardingSchema } from "./schemas/onboarding.schema";
import { CalorieAnalysisService } from "./services/calorie_analysis.service";
import { CalorieService } from "./services/calorie.service";
import { OnboardingService } from "./services/onboarding.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CalorieAnalysis.name, schema: CalorieAnalysisSchema },
      { name: Onboarding.name, schema: OnboardingSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => MediaModule),
  ],
  controllers: [CalorieController],
  providers: [CalorieService, CalorieAnalysisService, OnboardingService],
  exports: [CalorieService, CalorieAnalysisService, OnboardingService],
})
export class CalorieModule {}
