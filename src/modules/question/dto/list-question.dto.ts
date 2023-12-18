import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class ListQuestionDto {
  @IsNumberString()
  @IsOptional(null)
  page: number;

  @IsNumberString()
  @IsOptional(null)
  limit: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  order_by: "DESC" | "ASC";

  @IsString()
  @IsOptional(null)
  parent_id: string;

  @IsString()
  @IsOptional(null)
  ref_id: string;

  @IsString()
  @IsOptional(null)
  status: string;

  @IsString()
  @IsOptional(null)
  search: string;

  @IsString()
  @IsOptional(null)
  user_id: string;

  @IsString()
  @IsOptional(null)
  question_key: string;

  @IsString()
  @IsOptional(null)
  question_language: string;

  @IsNumberString()
  @IsOptional(null)
  is_official: number
}
