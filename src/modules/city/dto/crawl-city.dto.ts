import { IsDate, IsNumberString, IsEmpty, IsIn, IsLongitude, IsLatitude, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CrawlCityDto {
  @IsNumberString()
  @IsOptional(null)
  page: number;

  @IsNumberString()
  @IsOptional(null)
  limit: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  order_by: "DESC" | "ASC";
}
