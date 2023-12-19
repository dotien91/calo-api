import { IsString } from "class-validator";

export class UpdateUserFollowEventDto {
  @IsString()
  user_id: string;

  @IsString()
  event_id: string;
}
