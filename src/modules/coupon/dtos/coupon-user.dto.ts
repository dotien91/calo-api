import { IsDefined, IsString } from "class-validator";

export interface FilterCouponUserDTO {}

export class CreateCouponUserDTO {
  @IsDefined()
  @IsString()
  coupon_id: string;
}

export class ApplyCouponByCodeDTO {
  @IsDefined()
  @IsString()
  code: string;
}

