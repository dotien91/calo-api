import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";
import { METRICS, TRACKING_TYPES } from "../enums/tracking.enum";

export class ListTrackingDto {
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
  @IsIn(TRACKING_TYPES)
  type: string;

  @IsString()
  @IsOptional(null)
  @IsIn(METRICS)
  metric: string;

  @IsString()
  @IsOptional(null)
  user_id: string;
}
