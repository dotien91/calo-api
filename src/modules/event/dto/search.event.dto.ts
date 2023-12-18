import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString, IsLatitude, IsLongitude, IsJSON } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SearchEventDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by: "DESC" | "ASC";

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  auth_id: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  search: string

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  distance: number

  @IsLatitude()
  @IsOptional(null)
  @ApiPropertyOptional()
  latitude?: number

  @IsLongitude()
  @IsOptional(null)
  @ApiPropertyOptional()
  longitude?: number

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  language?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  city?: string

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  type?: string

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id?: string

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  category?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  date?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  price?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  currency?: string

  event_ids?: string[]
}
