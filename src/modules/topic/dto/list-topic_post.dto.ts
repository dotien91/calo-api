import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class ListTopicPostDto {
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
  post_status: string;

  @IsString()
  @IsOptional(null)
  post_language: string;

  @IsString()
  @IsOptional(null)
  user_id: string;

  @IsString()
  @IsOptional(null)
  chat_room_id: string;

  @IsString()
  @IsOptional(null)
  topic_id: string

  @IsNumberString()
  @IsOptional(null)
  is_homepage: number

  @IsNumberString()
  @IsOptional(null)
  is_trending: number

}
