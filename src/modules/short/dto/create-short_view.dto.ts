import { IsNumberString, IsString } from "class-validator";

export class CreateShortViewDto {
	@IsString()
	video_id: string

  @IsNumberString()
  total_time: string
}
