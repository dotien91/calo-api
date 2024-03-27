import { IsDateString, IsIn, IsObject, IsOptional, IsString } from "class-validator";
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
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  channel?: string;

  @IsDateString()
  @IsOptional(null)
  send_start?: string;

  @IsIn(["0", "1", "2"])
  @IsOptional()
  manual_mode?: number;

  @IsString()
  @IsOptional()
  router?: string;

  @IsObject()
  @IsOptional()
  replace_pattern?: object;
}
