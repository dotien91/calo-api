import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";
import { CreateCommunityCategoryDto } from "./create-community_category.dto";

export class UpdateCommunityCategoryDto extends PartialType(CreateCommunityCategoryDto) {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id?: String

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_status?: string
}
