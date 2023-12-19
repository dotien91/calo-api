import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn } from "class-validator";
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
  channel_id: string;

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
}
