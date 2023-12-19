import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumberString } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";
import { CreatePodcastCategoryDto } from "./create-podcast_category.dto";

export class UpdatePodcastCategoryDto extends PartialType(CreatePodcastCategoryDto) {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_status?: string;
}
