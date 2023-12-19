import { IsOptional, IsDateString, IsString, IsNumberString, IsIn } from "class-validator";
export class CreatePurchaseAppleDto {
  @IsString()
  @IsOptional(null)
  order_id: string;

  @IsString()
  @IsOptional(null)
  local_order_id: string;

  @IsString()
  @IsOptional(null)
  package_name: string;

  @IsString()
  @IsOptional(null)
  product_id: string;

  @IsNumberString()
  @IsOptional(null)
  purchase_time: string;

  @IsString()
  @IsOptional(null)
  purchase_state: string;

  @IsString()
  @IsOptional(null)
  purchase_token: string;

  @IsString()
  @IsOptional(null)
  quantity: string;

  @IsString()
  @IsOptional(null)
  acknowledged: string;
}
