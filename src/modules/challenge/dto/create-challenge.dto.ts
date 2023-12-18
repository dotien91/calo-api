import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject, IsNumber, IsJSON, IsBoolean } from 'class-validator';
export class CreateChallengeDto {
  @IsString()
  @ApiProperty()
  title: string

  @IsString()
  @ApiProperty()
  game_id: string

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  channel_id: string

  @IsString()
  @ApiProperty()
  description: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  long_description: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  avatar: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  media_id: string

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  start_time: string

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  end_time: string

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  level_value: string

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  max_user: string

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  coin_value: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  language: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  country: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  version: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_status: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  trash_status: string

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  gift_data?: any

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  challenge_stage?: any

  @IsBoolean()
  @IsOptional(null)
  @ApiPropertyOptional()
  add_all_user?: boolean

  @IsBoolean()
  @IsOptional(null)
  @ApiPropertyOptional()
  create_next_cycle?: boolean
}
