import {
  IsDate,
  IsNumberString,
  IsEmpty,
  IsIn,
  IsDefined,
  ValidateIf,
  IsOptional,
  IsString,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ListPodcastCategoryDto {
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

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  version: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_status: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id: string;
}
