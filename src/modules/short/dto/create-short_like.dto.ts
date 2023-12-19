import { IsString } from "class-validator";

export class CreateShortLikeDto {
  @IsString()
  video_id: string;
}
