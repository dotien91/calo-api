import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class SearchEventIndexDto {
  @IsNumberString()
  @IsOptional(null)
  page?: number;

  @IsNumberString()
  @IsOptional(null)
  limit?: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  order_by?: "DESC" | "ASC";

  date?: string;
  event_id?: string;
}
