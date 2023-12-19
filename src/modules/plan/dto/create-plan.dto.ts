import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";
export class CreatePlanDto {
  @IsString()
  @ApiProperty()
  service_id: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsNumberString()
  @ApiProperty()
  price: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  amount_of_day: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  trial_day?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  amount_of_coin: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  description: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id?: string;

  @IsIn(["recurring", "one_time", "coin"])
  @ApiProperty()
  type: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  image: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  country: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  version: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ref_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  google_store_product_id: string;
}
