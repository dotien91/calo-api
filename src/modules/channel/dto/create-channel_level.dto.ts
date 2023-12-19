import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";
import { ObjectId } from "mongoose";
import { ChatMedia } from "../../../modules/chat_media/schemas/chat_media.schema";

export class CreateChannelLevelDto {
  @IsString()
  @ApiProperty()
  channel_id?: string;

  @IsString()
  @ApiProperty()
  title?: string | string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  media_id?: string | ObjectId;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  course_id?: string | ObjectId;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  parent_id?: string | ObjectId;

  @IsNumberString()
  @ApiPropertyOptional()
  @IsOptional(null)
  level_point?: string | number;

  @IsNumberString()
  @ApiProperty()
  level_number?: string | number;
  total_member?: string | number;
}
