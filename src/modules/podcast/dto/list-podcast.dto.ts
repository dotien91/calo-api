import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class ListPodcastDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit?: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by?: "DESC" | "ASC";

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  order_type?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  podcast_type?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  podcast_category?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  search?: string;

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
  podcast_language?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  comment_number?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  auth_id: string;
}
