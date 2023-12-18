import { IsDate, IsNumberString, IsEmpty, IsIn, IsLongitude, IsLatitude, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class ListCityDto {
  @IsNumberString()
  @IsOptional(null)
  page?: number;

  @IsNumberString()
  @IsOptional(null)
  limit?: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  order_by?: "DESC" | "ASC";

  @IsString()
  @IsOptional(null)
  country?: string;

  @IsString()
  @IsOptional(null)
  country_iso2?: string

  @IsString()
  @IsOptional(null)
  search?: string;

  @IsNumberString()
  @IsOptional(null)
  distance?: string

  @IsLatitude()
  @IsOptional(null)
  latitude?: number

  @IsLongitude()
  @IsOptional(null)
  longitude?: number

  capital?: string[]
  point?: any[]
  unset?: any[]

  @IsString()
  @IsOptional(null)
  is_nearby?: string
  have_group?: number
  have_image?: number
}
