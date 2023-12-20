import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsIn, IsJSON, IsNumberString, IsObject, IsOptional, IsString } from "class-validator";
export class CreateCommunityDto {
  @IsString()
  @ApiProperty()
  post_language?: string;

  @IsString()
  @ApiProperty()
  post_content?: string;

  @IsString()
  @ApiProperty()
  channel_id?: string;

  @IsString()
  @ApiProperty()
  post_title?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_excerpt?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_category?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_parent?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_status?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  other_status?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_avatar?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_type?: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_album?: any;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  attach_files?: any;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_object?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  poll_ids?: any

  data_json?: string
  ref_id?: string
}
