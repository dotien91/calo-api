import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsJSON } from "class-validator";
export class CreateTopicDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  image: string;

  @IsJSON()
  @IsOptional(null)
  public_album: string;

  @IsNumberString()
  @IsOptional(null)
  is_official: number;

  @IsNumberString()
  @IsOptional(null)
  is_validate: number;

  @IsString()
  @IsOptional(null)
  parent_id: string;

  @IsString()
  @IsOptional(null)
  chat_room_id: string;
}
