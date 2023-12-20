import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsDateString, IsDefined, IsEmpty, IsIn, IsNumberString, IsOptional, IsString, ValidateIf } from "class-validator";

export class ListCommunityCategoryDto {
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
  version: string

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_status: string
}
