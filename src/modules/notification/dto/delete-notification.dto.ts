import { IsDefined, IsOptional, IsString } from "class-validator";

export class DeleteNotificationDto {
  @IsString()
  @IsOptional(null)
  notification_id?: string;

  @IsString()
  @IsDefined(null)
  user_id: string;
}

