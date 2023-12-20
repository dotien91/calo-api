import { Type } from "class-transformer";
import { IsDate, IsDefined, IsEmpty, IsIn, IsNumberString, IsOptional, IsString, ValidateIf } from "class-validator";

export class ListShortDto {
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
  post_type: string;

  @IsString()
  @IsOptional(null)
  search: string;

  @IsString()
  @IsOptional(null)
  language: string;

  @IsString()
  @IsOptional(null)
  ids: string;

  @IsString()
  @IsOptional(null)
  ref_id: string;

  @IsString()
  @IsOptional(null)
  country: string;

  @IsString()
  @IsOptional(null)
  user_id: string;

  @IsNumberString()
  @IsOptional(null)
  short_status: string;

  @IsString()
  @IsOptional(null)
  is_exclude: string;

  @IsString()
  @IsOptional(null)
  only_id: string

  @IsString()
  @IsOptional(null)
  short_category: string
}
