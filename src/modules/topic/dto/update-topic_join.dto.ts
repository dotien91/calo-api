import { IsString, IsOptional, IsIn } from "class-validator";
import { CreateTopicJoinDto } from "./create-topic_join.dto";

export class UpdateTopicJoinDto extends CreateTopicJoinDto {
  @IsString()
  _id?: string;
}
