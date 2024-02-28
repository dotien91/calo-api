import { PartialType } from "@nestjs/mapped-types";
import { IsDefined, IsString } from "class-validator";
import { CreatePodcastCategoryDto } from "./create-podcast_category.dto";

export class UpdatePodcastCategoryDto extends PartialType(CreatePodcastCategoryDto) {
  @IsString()
  @IsDefined()
  _id: string;
}
