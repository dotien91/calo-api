export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY',             // Ít vận động
  LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE',   // Nhẹ (1-3 ngày/tuần)
  MODERATELY_ACTIVE = 'MODERATELY_ACTIVE', // Vừa (3-5 ngày/tuần)
  VERY_ACTIVE = 'VERY_ACTIVE',         // Nhiều (6-7 ngày/tuần)
  EXTREMELY_ACTIVE = 'EXTREMELY_ACTIVE', // Cực nhiều
}

export enum WeightGoalPace {
  SLOW = 'SLOW',           // 0.25 kg/tuần
  NORMAL = 'NORMAL',       // 0.5 kg/tuần
  FAST = 'FAST',           // 1.0 kg/tuần
}
