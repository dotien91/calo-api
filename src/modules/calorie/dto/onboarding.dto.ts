import { IsEnum, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { Gender, ActivityLevel, WeightGoalPace } from '../enums/calorie.enum';

export class OnboardingDto {
  @IsEnum(Gender, { message: 'Gender phải là MALE hoặc FEMALE' })
  @IsNotEmpty()
  gender: Gender;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(150)
  age: number; // Cần tuổi để tính BMR

  @IsNumber()
  @IsNotEmpty()
  @Min(50)
  @Max(250)
  height: number; // cm

  @IsNumber()
  @IsNotEmpty()
  @Min(20)
  @Max(300)
  currentWeight: number; // kg

  @IsNumber()
  @IsNotEmpty()
  @Min(20)
  @Max(300)
  targetWeight: number; // kg

  @IsEnum(ActivityLevel, { message: 'ActivityLevel không hợp lệ' })
  @IsNotEmpty()
  activityLevel: ActivityLevel;

  @IsEnum(WeightGoalPace, { message: 'WeightGoalPace phải là SLOW, NORMAL hoặc FAST' })
  @IsNotEmpty()
  pace: WeightGoalPace;
}
