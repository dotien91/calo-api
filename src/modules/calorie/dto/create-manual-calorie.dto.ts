import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

class ManualIngredientDto {
  @IsNotEmpty({ message: "Tên nguyên liệu không được để trống" })
  @IsString()
  name: string;

  @IsNotEmpty({ message: "Khối lượng nguyên liệu không được để trống" })
  @IsNumber()
  @Min(0)
  weight: number;

  @IsOptional()
  @IsString()
  @IsIn(["g", "ml"], { message: "unit chỉ chấp nhận 'g' hoặc 'ml'" })
  unit?: "g" | "ml";

  @IsNotEmpty({ message: "Calories nguyên liệu không được để trống" })
  @IsNumber()
  @Min(0)
  calories: number;

  @IsNotEmpty({ message: "Carbs nguyên liệu không được để trống" })
  @IsNumber()
  @Min(0)
  carbs: number;

  @IsNotEmpty({ message: "Protein nguyên liệu không được để trống" })
  @IsNumber()
  @Min(0)
  protein: number;

  @IsNotEmpty({ message: "Fat nguyên liệu không được để trống" })
  @IsNumber()
  @Min(0)
  fat: number;
}

export class CreateManualCalorieDto {
  @IsOptional()
  @IsString()
  food_name?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsNotEmpty({ message: "Tổng khối lượng không được để trống" })
  @IsNumber()
  @Min(0)
  total_weight: number;

  @IsNotEmpty({ message: "Tổng calories không được để trống" })
  @IsNumber()
  @Min(0)
  total_calories: number;

  @IsNotEmpty({ message: "Tổng carbs không được để trống" })
  @IsNumber()
  @Min(0)
  total_carbs: number;

  @IsNotEmpty({ message: "Tổng protein không được để trống" })
  @IsNumber()
  @Min(0)
  total_protein: number;

  @IsNotEmpty({ message: "Tổng fat không được để trống" })
  @IsNumber()
  @Min(0)
  total_fat: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManualIngredientDto)
  ingredients?: ManualIngredientDto[];
}
