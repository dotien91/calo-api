import { IsNumberString, IsString } from "class-validator";

export class UpdateShortViewDto {
  @IsString()
  user_id: string;

  @IsString()
  video_id: string;

  @IsNumberString()
  total_time: number;
}
