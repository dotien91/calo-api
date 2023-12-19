import { IsDateString, IsIn, IsOptional, IsString } from "class-validator";
export class CreateSubscribeDto {
  @IsString()
  plan_id: string;

  @IsString()
  user_id: string;

  @IsString()
  @IsOptional(null)
  coupon_code: string;

  @IsString()
  @IsOptional(null)
  channel_id: string;

  @IsIn(["active", "deactivate", "expired"])
  status: string;

  @IsDateString()
  start_at: string;

  @IsDateString()
  end_at: string;
}
