import { IsDateString, IsIn, IsOptional, IsString } from "class-validator";
export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  user_id: string | string[];

  @IsString()
  @IsOptional(null)
  createdBy?: string;

  @IsString()
  content: string;

  @IsIn(["link"])
  type_action: string;

  @IsString()
  @IsOptional(null)
  param?: string;

  @IsString()
  @IsOptional(null)
  click_action?: string;

  @IsString()
  image: string;

  @IsDateString()
  @IsOptional(null)
  send_start?: string;

  @IsIn(["0", "1", "2"])
  @IsOptional()
  manual_mode?: number;

  @IsString()
  @IsOptional()
  router?: string;
}
