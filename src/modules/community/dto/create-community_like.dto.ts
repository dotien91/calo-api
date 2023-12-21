import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateCommunityLikeDto {
	@IsString()
  @IsOptional()
  @ApiPropertyOptional()
	community_id?: string

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
	comment_id?: string
}
