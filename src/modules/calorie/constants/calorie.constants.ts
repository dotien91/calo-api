import { ActivityLevel, WeightGoalPace } from '../enums/calorie.enum';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  [ActivityLevel.SEDENTARY]: 1.2,
  [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
  [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
  [ActivityLevel.VERY_ACTIVE]: 1.725,
  [ActivityLevel.EXTREMELY_ACTIVE]: 1.9,
};

// Lượng calo cần dư ra (tăng cân) hoặc thâm hụt (giảm cân) mỗi ngày
// 0.5kg mỡ ~ 3850kcal => chia cho 7 ngày ~ 550kcal/ngày
export const PACE_CALORIES: Record<WeightGoalPace, number> = {
  [WeightGoalPace.SLOW]: 275,   // +/- 0.25kg
  [WeightGoalPace.NORMAL]: 550, // +/- 0.5kg (Chuẩn video)
  [WeightGoalPace.FAST]: 1100,  // +/- 1.0kg
};
