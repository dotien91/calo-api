import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject } from "class-validator";
export class CreateTopicJoinDto {
  @IsString()
  user_id: string;

  @IsString()
  topic_id: string;

  @IsString()
  @IsOptional(null)
  parent_id?: string;

  @IsString()
  @IsOptional(null)
  is_official?: string;

  @IsString()
  @IsOptional(null)
  status?: string;
}
