import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsIn, IsJSON, IsNumberString, IsObject, IsOptional, IsString } from "class-validator";
export class CreateCommunityCommentDto {
  @IsString()
  @ApiProperty()
  community_id?: string;

  @IsString()
  @ApiPropertyOptional()
  content?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  parent_id?: string;
}
