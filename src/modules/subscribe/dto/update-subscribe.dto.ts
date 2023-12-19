import { IsDateString, IsIn, IsOptional, IsString } from "class-validator";

export class UpdateSubscribeDto {
  @IsString()
  _id?: string;

  @IsString()
  @IsOptional(null)
  coupon_code: string;

  @IsString()
  @IsOptional(null)
  channel_id: string;

  @IsIn(["active", "deactivate", "expired"])
  status: string;

  @IsDateString()
  @IsOptional(null)
  start_at: string;

  @IsDateString()
  @IsOptional(null)
  end_at: string;
}
