import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { ApiOperation, ApiPropertyOptional } from "@nestjs/swagger";

export class ListChallengePermissionDto {
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
  challenge_id: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  official_status: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  search?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id?: string
}
