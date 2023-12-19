import { IsDate, IsNumberString, IsEmpty, IsIn, IsDefined, ValidateIf, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { ApiOperation, ApiPropertyOptional } from "@nestjs/swagger";

export class ListChallengeGameDto {
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
  parent_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  challenge_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  auth_id: string;

  @IsIn(["0", "1"])
  @IsOptional(null)
  @ApiPropertyOptional()
  is_parent: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  game_type?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id?: string;

  @IsIn(["0", "1"])
  @IsOptional(null)
  @ApiPropertyOptional()
  is_child: string;
}
