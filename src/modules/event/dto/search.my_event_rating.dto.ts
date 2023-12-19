import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class SearchMyEventRatingDto {
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
  event_id: string;

  user_id: string;
}
