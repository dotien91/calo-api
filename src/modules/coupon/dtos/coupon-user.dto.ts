import { IsOptional, IsString } from "class-validator";

export interface FilterCouponUserDTO {}

export class CreateCouponUserDTO {
  @IsOptional()
  @IsString()
  coupon_id?: string;

  @IsOptional()
  @IsString()
  code?: string;
}

