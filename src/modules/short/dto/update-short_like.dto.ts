import { IsString } from "class-validator";

export class UpdateShortLikeDto {
  @IsString()
  user_id: string;

  @IsString()
  video_id: string;
}
