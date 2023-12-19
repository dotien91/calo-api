import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class ListUserIncomeDto {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ref_type: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  time_zone: string;

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
  method: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id: string;
}
