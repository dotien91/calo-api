import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDefined, IsJSON, IsOptional, IsString } from "class-validator";

export class UpdateCommunityDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  _id: String;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_pin?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_comment?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_language?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_content?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
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
  poll_ids?: any;

  data_json?: string;
  ref_id?: string;
}
