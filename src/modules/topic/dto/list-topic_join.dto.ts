import {
  IsDate,
  IsNumberString,
  IsEmpty,
  IsIn,
  IsDefined,
  ValidateIf,
  IsOptional,
  IsString,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";

export class ListTopicJoinDto {
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
  is_parent: number;

  @IsString()
  @IsOptional(null)
  is_child: number;

  @IsString()
  @IsOptional(null)
  user_id: string;

  @IsString()
  @IsOptional(null)
  topic_id: string;

  @IsString()
  @IsOptional(null)
  parent_id?: string;

  @IsNumberString()
  @IsOptional(null)
  is_official?: number;

  @IsString()
  @IsOptional(null)
  status?: string;
}
