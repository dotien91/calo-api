import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject, IsJSON } from "class-validator";
export class CreateTicketDto {
  @IsString()
  @ApiProperty()
  post_language?: string;

  @IsString()
  @ApiProperty()
  post_content?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id?: string | string[];

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
  post_information?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_object?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  data_id?: string;
}
