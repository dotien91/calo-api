import {
  IsDate,
  IsNumberString,
  IsEmpty,
  IsIn,
  IsDefined,
  ValidateIf,
  IsOptional,
  IsString,
  IsNumber,
  IsBooleanString,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ListLawyerDto {
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

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  order_type?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  city?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  status?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  city_name?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  state_name?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  license_year?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  review_value?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  categories?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  language_spoken?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  search?: string;

  @IsBooleanString()
  @IsOptional()
  @ApiPropertyOptional()
  is_free_consultation?: string;

  @IsBooleanString()
  @IsOptional()
  @ApiPropertyOptional()
  open_for_business?: string;

  @IsBooleanString()
  @IsOptional()
  @ApiPropertyOptional()
  is_misconduct?: string;

  @IsBooleanString()
  @IsOptional()
  @ApiPropertyOptional()
  is_extra_virtual?: string;
}
