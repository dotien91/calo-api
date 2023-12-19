import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsJSON, IsOptional, IsString } from "class-validator";

export class CreateChallengeActivityDto {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  title: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  media_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  challenge_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  parent_id?: string;

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  start_time: string;

  @IsJSON()
  @ApiPropertyOptional()
  @IsOptional(null)
  data_activity?: any;

  point_value?: number;
  user_id?: string;
  official_status?: number;
}
