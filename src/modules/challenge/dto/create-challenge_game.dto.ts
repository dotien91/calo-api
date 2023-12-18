import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsJSON, IsOptional, IsString } from "class-validator";

export class CreateChallengeGameDto {
  @IsString()
  @ApiProperty()
  title: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  description: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  media_id: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  challenge_id: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id: string

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  parent_id?: string

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  game_type?: string

  @IsJSON()
  @ApiPropertyOptional()
  @IsOptional(null)
  custom_field?: any

  @IsJSON()
  @ApiPropertyOptional()
  @IsOptional(null)
  game_activity?: any
}
