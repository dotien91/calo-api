import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject, IsNumber, IsJSON } from 'class-validator';
export class CreateLivestreamDto {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  media_id?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  avatar?: string

  @IsString()
  @ApiProperty()
  title?: string

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  input_type?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  caption?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  cookies?: string

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  start_time?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ref_id?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  hashtag_id?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  livestream_status?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  livestream_source?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  input_status?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ready_status?: string

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  livestream_data?: any

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  product_id?: string
}
