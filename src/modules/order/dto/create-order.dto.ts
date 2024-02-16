import { Type } from "class-transformer";
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { OrderItemType, PayloadType } from "../interfaces/order.interface";

export class PayloadParams {
  @IsEnum(PayloadType)
  @IsOptional()
  type?: PayloadType;

  @IsObject()
  @IsOptional()
  data?: object;
}

// export class CreateOrderDto {
//   @IsString()
//   @ApiProperty()
//   plan_id: string;

//   @IsNumberString()
//   @ApiProperty()
//   amount_of_package: number;

//   @IsString()
//   @IsOptional(null)
//   @ApiPropertyOptional()
//   payment_method: string;

//   @IsString()
//   @IsOptional(null)
//   @ApiPropertyOptional()
//   order_note: string;

//   @IsString()
//   @IsOptional(null)
//   @ApiPropertyOptional()
//   coupon_code: string;

//   @IsString()
//   @IsOptional(null)
//   @ApiPropertyOptional()
//   description: string;

//   @IsString()
//   @IsOptional(null)
//   @ApiPropertyOptional()
//   trans_id: string;

//   @IsString()
//   @IsOptional(null)
//   @ApiPropertyOptional()
//   deep_link: string;

//   @IsObject()
//   @IsDefined()
//   @ValidateNested({ each: true })
//   @Type(() => PayloadParams)
//   payload: PayloadParams;

//   @IsString()
//   @IsOptional(null)
//   @ApiPropertyOptional()
//   coupon_product_id?: string;
// }

export class PlanObject {
  @IsString()
  @IsDefined()
  plan_id: string;

  @IsNumberString()
  @IsDefined()
  amount_of_package: number;

  @IsString()
  @IsDefined()
  @IsEnum(OrderItemType)
  type: OrderItemType;

  @IsObject()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PayloadParams)
  payload: PayloadParams;
}

export class CreateOrderDto {
  @IsArray()
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => PlanObject)
  plan_objects: PlanObject[];

  @IsString()
  @IsOptional(null)
  payment_method: string;

  @IsString()
  @IsOptional(null)
  order_note: string;

  @IsString()
  @IsOptional(null)
  description: string;

  @IsString()
  @IsOptional(null)
  trans_id: string;

  @IsString()
  @IsOptional(null)
  deep_link: string;

  @IsString()
  @IsOptional(null)
  coupon_product_id?: string;
}
