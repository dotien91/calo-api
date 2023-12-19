import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn, IsJSON, IsNumberString } from "class-validator";
import { CreateRequestDto } from "./create-request.dto";
import { PartialType } from "@nestjs/mapped-types";
import { CreateRequestCommentDto } from "./create-request_comment.dto";

export class UpdateRequestCommentDto extends PartialType(CreateRequestCommentDto) {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id?: String;
}
