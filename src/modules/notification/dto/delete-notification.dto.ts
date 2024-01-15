import { IsOptional, IsString } from "class-validator";

export class DeleteNotificationDto {
  @IsString()
  @IsOptional(null)
  notification_id?: string;

  @IsString()
  @IsOptional(null)
  user_id?: string;
}

