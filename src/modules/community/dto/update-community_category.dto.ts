import { PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";
import { CreateCommunityCategoryDto } from "./create-community_category.dto";

export class UpdateCommunityCategoryDto extends PartialType(CreateCommunityCategoryDto) {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_status?: string;
}
