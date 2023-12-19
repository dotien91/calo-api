import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdateOrderDto {
  @IsString()
  @ApiProperty()
  _id?: string;

  @IsIn(["google_payment", "apple_payment", "transfer", "stripe", "vn_pay", "paypal"])
  @IsOptional(null)
  @ApiPropertyOptional()
  payment_method?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  order_note?: string;

  @IsIn(["pending", "processing", "fraud", "success", "close", "draft", "trial", "error", "trial_false", "done"])
  @ApiProperty()
  status?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  client_secret?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  media_id?: string;

  redirect_url?: string;
}
