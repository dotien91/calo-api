import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject, IsJSON } from "class-validator";
import { ObjectId } from "mongoose";
import { ChatMedia } from "../../../modules/chat_media/schemas/chat_media.schema";
export class CreateRequestCategoryDto {
  @IsString()
  @ApiProperty()
  category_language?: string | String;

  @IsString()
  @ApiProperty()
  channel_id?: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  category_content?: string | String;

  @IsString()
  @ApiPropertyOptional()
  category_title?: string | String

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
  category_avatar?: string | ChatMedia;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_type?: string | String;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_status?: string | Number;
}
