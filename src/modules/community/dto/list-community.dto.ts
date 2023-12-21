import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsDateString, IsDefined, IsEmpty, IsIn, IsNumberString, IsOptional, IsString, ValidateIf } from "class-validator";

export class ListCommunityDto {
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
  @ApiPropertyOptional()
  @IsOptional(null)
  order_type: any

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_type: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_category: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  search: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_parent: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_status: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_language: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_pin: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  comment_number: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  data_json_type: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  auth_id: string;
}
