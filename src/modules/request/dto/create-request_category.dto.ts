import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject, IsJSON } from "class-validator";
import { ObjectId } from "mongoose";
import { ChatMedia } from "../../../modules/chat_media/schemas/chat_media.schema";
export class CreateRequestCategoryDto {
  @IsString()
  @ApiProperty()
  category_language?: string | string;

  @IsString()
  @ApiProperty()
  channel_id?: string;

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
  category_avatar?: string | ChatMedia;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category_type?: string | string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_status?: string | number;
}
