import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";
import { Media } from "../../../modules/media/schemas/media.schema";
export class CreateCommunityCategoryDto {
  @IsString()
  @ApiProperty()
  category_language?: string | string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  category_content?: string | string;

  @IsString()
  @ApiPropertyOptional()
  category_title?: string | string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_excerpt?: string | string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_parent?: string | string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_status?: string | string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_avatar?: string | Media;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_type?: string | string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_status?: string | number;
}
