import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn, IsJSON, IsNumberString } from "class-validator";
import { CreatePodcastDto } from "./create-podcast.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdatePodcastDto extends PartialType(CreatePodcastDto) {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id?: string;
}
