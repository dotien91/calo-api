import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsJSON, IsNumberString, IsOptional, IsString } from "class-validator";
import { CreateCommunityDto } from "./create-community.dto";
import { CreateCommunityCommentDto } from "./create-community_comment.dto";

export class UpdateCommunityCommentDto extends PartialType(CreateCommunityCommentDto) {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id?: String
}
