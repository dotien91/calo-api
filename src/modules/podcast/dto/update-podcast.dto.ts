import { PartialType } from "@nestjs/mapped-types";
import { IsDefined, IsString } from "class-validator";
import { CreatePodcastDto } from "./create-podcast.dto";

export class UpdatePodcastDto extends PartialType(CreatePodcastDto) {
  @IsString()
  @IsDefined()
  _id: string;
}
