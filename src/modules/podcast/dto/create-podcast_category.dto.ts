import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject, IsJSON } from "class-validator";
export class CreatePodcastCategoryDto {
  @IsString()
  @ApiProperty()
  category_language?: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  channel_id?: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  category_content?: string;

  @IsString()
  @ApiPropertyOptional()
  category_title?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_excerpt?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_parent?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_status?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_avatar?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_type?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_status?: string;
}
