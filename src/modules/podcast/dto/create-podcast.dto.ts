import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsJSON, IsOptional, IsString } from "class-validator";
export class CreatePodcastDto {
  @IsString()
  @ApiProperty()
  podcast_language?: string;

  @IsString()
  @ApiProperty()
  content?: string;

  @IsString()
  @ApiProperty()
  title?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  excerpt?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  podcast_category?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_parent?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  podcast_status?: string;

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
  podcast_type?: string;

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
  post_information?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_object?: string;
}
