import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class ListCommunityCommentDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page_child: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit_child: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by: "DESC" | "ASC";

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by_child: "DESC" | "ASC";

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  community_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  parent_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  from_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  to_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  search: string;

  @IsString()
  @IsOptional(null)
  @ApiProperty()
  @ApiPropertyOptional()
  auth_id: string;
}
