import { PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDefined, IsString } from "class-validator";
import { CreateCommunityCommentDto } from "./create-community_comment.dto";

export class UpdateCommunityCommentDto extends PartialType(CreateCommunityCommentDto) {
  @IsString()
  @IsDefined()
  @ApiPropertyOptional()
  _id: String;
}
