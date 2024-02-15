import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDefined,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { PayloadType } from "../interfaces/order.interface";

export class PayloadParams {
  @IsEnum(PayloadType)
  @IsOptional()
  type?: PayloadType;

  @IsObject()
  @IsOptional()
  data?: object;
}

export class CreateOrderDto {
  @IsString()
  @ApiProperty()
  plan_id: string;

  @IsNumberString()
  @ApiProperty()
  amount_of_package: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  payment_method: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  order_note: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  coupon_code: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  description: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  trans_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  deep_link: string;

  @IsObject()
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => PayloadParams)
  payload: PayloadParams;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  coupon_product_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  coupon_shipping_id?: string;

  @IsNumber()
  @IsOptional(null)
  @ApiPropertyOptional()
  shipping_fee?: number;
}
