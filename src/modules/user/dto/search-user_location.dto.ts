import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsIn, IsLatitude, IsLongitude, IsNumberString, IsOptional, IsString } from "class-validator";

export class SearchUserLocationDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit?: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by?: "DESC" | "ASC";

  @IsOptional(null)
  @ApiProperty()
  distance?: number;

  @IsLatitude()
  @IsOptional(null)
  @ApiPropertyOptional()
  latitude?: number;

  @IsLongitude()
  @IsOptional(null)
  @ApiPropertyOptional()
  longitude?: number;

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  from?: string;

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  to?: string;

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  date?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id?: string;
}
