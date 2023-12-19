import { IsJSON, IsOptional, IsString } from "class-validator";
export class CreateConfigDto {
  @IsString()
  type: any;

  @IsString()
  @IsOptional(null)
  near_by_free: any;

  @IsString()
  @IsOptional(null)
  chat_free: any;

  @IsString()
  @IsOptional(null)
  call_free: any;

  @IsString()
  @IsOptional(null)
  call_pro: any;

  @IsString()
  @IsOptional(null)
  follow_free: any;

  @IsString()
  @IsOptional(null)
  view_today_free: any;

  @IsJSON()
  @IsOptional(null)
  filter_free: any;

  @IsJSON()
  @IsOptional(null)
  data_filter: any;

  @IsString()
  @IsOptional(null)
  data_content: any;

  @IsJSON()
  @IsOptional(null)
  filter_pro: any;

  @IsJSON()
  @IsOptional(null)
  filter_premium: any;

  @IsJSON()
  @IsOptional(null)
  option_content: any;
}
