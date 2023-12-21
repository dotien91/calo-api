import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsJSON, IsNumberString, IsOptional, IsString } from "class-validator";
import { CreateCommunityDto } from "./create-community.dto";

export class UpdateCommunityDto extends PartialType(CreateCommunityDto) {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id?: String

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_pin?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_comment?: string
}
