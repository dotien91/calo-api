import { IsDateString, IsIn, IsNumberString, IsOptional, IsString } from "class-validator";
import { METRICS } from "../enums/tracking.enum";

export class ListMyBodyTrackingDto {
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
  @IsIn(METRICS)
  metric: string;

  /** YYYY-MM-DD hoặc ISO 8601 */
  @IsOptional()
  @IsDateString()
  date_from?: string;

  /** YYYY-MM-DD hoặc ISO 8601 */
  @IsOptional()
  @IsDateString()
  date_to?: string;
}
