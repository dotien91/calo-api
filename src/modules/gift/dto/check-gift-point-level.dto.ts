import { IsString, IsNumber, IsOptional } from "class-validator";
import { Gift } from "../schemas/gift.schema";
export class CheckGiftPointLevelDto {
  @IsString()
  channel_id: string;

  @IsString()
  user_id: string;

  @IsNumber()
  point: number;

  @IsNumber()
  level: number;

  @IsNumber()
  @IsOptional(null)
  total_like: number;

  @IsNumber()
  @IsOptional(null)
  total_comment: number;

  @IsNumber()
  @IsOptional(null)
  total_view_course: number;
}
