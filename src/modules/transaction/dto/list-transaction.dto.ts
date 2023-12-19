import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ListTransactionDto {
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
  status: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  method: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ref_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ref_type: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ref_url: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  from: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  to: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  type_system: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  search: string;
}
