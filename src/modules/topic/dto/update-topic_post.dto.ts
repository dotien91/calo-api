import { IsString, IsOptional, IsIn } from "class-validator";
import { CreateTopicPostDto } from "./create-topic_post.dto";

export class UpdateTopicPostDto extends CreateTopicPostDto {
  @IsString()
  _id: string;

  @IsString()
  @IsOptional(null)
  post_title: string;

  @IsString()
  @IsOptional(null)
  post_content: string;

  @IsString()
  @IsOptional(null)
  post_language: string;

  @IsString()
  @IsOptional(null)
  post_slug: string;
}
