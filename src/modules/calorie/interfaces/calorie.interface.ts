export interface IIngredient {
  name: string;
  weight: number;
  unit: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export interface ICalorieAnalysis {
  food_name: string;
  health_score: number;
  health_reason?: string;
  total_weight: number;
  total_calories: number;
  total_carbs: number;
  total_protein: number;
  total_fat: number;
  ingredients: IIngredient[];
  image_url?: string;
}
