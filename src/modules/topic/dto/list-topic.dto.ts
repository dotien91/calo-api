import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class ListTopicDto {
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
  status: string;

  @IsString()
  @IsOptional(null)
  search: string;

  @IsString()
  @IsOptional(null)
  user_id: string;

  @IsNumberString()
  @IsOptional(null)
  is_official: number;

  @IsNumberString()
  @IsOptional(null)
  is_validate: number;

  @IsNumberString()
  @IsOptional(null)
  is_parent: number;

  @IsNumberString()
  @IsOptional(null)
  is_child: number;
}
