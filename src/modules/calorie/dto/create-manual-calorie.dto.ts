import { IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";

export class CreateManualCalorieDto {
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
}
