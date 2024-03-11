import { IsDateString, IsDefined, IsEnum, IsIn, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";
import { TestType } from "../interfaces/test.interface.i";

export interface FilterTestDTO {
  created_user_id?: string;
  title?: string;
  type?: TestType;
}

export class ListTestDto {
  @IsNumberString()
  @IsOptional()
  page?: number;

  @IsNumberString()
  @IsOptional()
  limit?: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional()
  order_by?: "DESC" | "ASC";

  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(TestType)
  @IsOptional()
  type?: TestType;
}

export class CreateTestDTO {
  @IsString()
  @IsDefined()
  title: string;

  @IsString()
  @IsOptional()
  parent_id?: string;

  @IsString()
  @IsDefined()
  description: string;

  @IsNumber()
  @IsDefined()
  duration_time: number;

  @IsDateString()
  @IsOptional()
  start_time?: string;

  @IsDateString()
  @IsOptional()
  end_time?: string;

  @IsEnum(TestType)
  @IsDefined()
  type: TestType;
}

export class UpdateTestDTO {
  @IsString()
  @IsDefined()
  _id: string;

  @IsString()
  @IsOptional()
  parent_id?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  duration_time?: number;

  @IsDateString()
  @IsOptional()
  start_time?: string;

  @IsDateString()
  @IsOptional()
  end_time?: string;

  @IsEnum(TestType)
  @IsOptional()
  type: TestType;
}
