import { IsDateString, IsDefined, IsEnum, IsIn, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";
import { CouponPaymentMethod, CouponPromotionType, CouponType, CouponVisible } from "../interfaces/coupon.interface.i";

export interface FilterCouponDTO {
  title?: string;
  payment_method?: CouponPaymentMethod;
  type?: CouponType;
  user_id?: string;
  visible?: CouponVisible;
}

export class ListCouponDto {
  @IsNumberString()
  @IsOptional()
  page?: number;

  @IsNumberString()
  @IsOptional()
  limit?: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional()
  order_by?: "DESC" | "ASC";

  @IsString()
  @IsOptional()
  title?: string;

  @IsOptional()
  @IsEnum(CouponPaymentMethod)
  payment_method?: CouponPaymentMethod;

  @IsOptional()
  @IsEnum(CouponType)
  type?: CouponType;

  @IsOptional()
  @IsEnum(CouponVisible)
  visible?: CouponVisible;

  @IsOptional()
  @IsString()
  user_id?: string;
}

export class CreateCouponDTO {
  @IsDefined()
  @IsString()
  title: string;

  @IsDefined()
  @IsString()
  description: string;

  @IsDefined()
  @IsEnum(CouponPaymentMethod)
  payment_method: CouponPaymentMethod;

  @IsDefined()
  @IsEnum(CouponType)
  type: CouponType;

  @IsDefined()
  @IsNumber()
  promotion: number;

  @IsDefined()
  @IsEnum(CouponPromotionType)
  promotion_type: CouponPromotionType;

  @IsOptional()
  @IsNumber()
  promotion_max?: number;

  @IsOptional()
  @IsNumber()
  promotion_min_trigger?: number;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsString()
  media_id?: string;

  @IsOptional()
  @IsDateString()
  expired?: string;

  @IsOptional()
  @IsDateString()
  availableAt?: string;

  @IsOptional()
  @IsEnum(CouponVisible)
  visible?: CouponVisible;
}

export class UpdateCouponDTO {
  @IsDefined()
  @IsString()
  _id: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CouponPaymentMethod)
  payment_method?: CouponPaymentMethod;

  @IsOptional()
  @IsEnum(CouponType)
  type?: CouponType;

  @IsOptional()
  @IsNumber()
  promotion?: number;

  @IsOptional()
  @IsEnum(CouponPromotionType)
  promotion_type?: CouponPromotionType;

  @IsOptional()
  @IsNumber()
  promotion_max?: number;

  @IsOptional()
  @IsNumber()
  promotion_min_trigger?: number;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsString()
  media_id?: string;

  @IsOptional()
  @IsDateString()
  expired?: string;

  @IsOptional()
  @IsDateString()
  availableAt?: string;

  @IsOptional()
  @IsEnum(CouponVisible)
  visible?: CouponVisible;
}
