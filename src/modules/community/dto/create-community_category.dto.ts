import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";
import { Media } from "../../../modules/media/schemas/media.schema";
export class CreateCommunityCategoryDto {
  @IsString()
  @ApiProperty()
  category_language?: string | String;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  category_content?: string | String;

  @IsString()
  @ApiPropertyOptional()
  category_title?: string | String;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_excerpt?: string | String;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_parent?: string | String;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_status?: string | String;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_avatar?: string | Media;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_type?: string | String;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_status?: string | Number;
}
