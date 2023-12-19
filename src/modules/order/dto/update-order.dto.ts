import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn } from "class-validator";

export class UpdateOrderDto {
  @IsString()
  @ApiProperty()
  _id?: String;

  @IsIn(["google_payment", "apple_payment", "transfer", "stripe", "vn_pay", "paypal"])
  @IsOptional(null)
  @ApiPropertyOptional()
  payment_method?: String;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  order_note?: String;

  @IsIn(["pending", "processing", "fraud", "success", "close", "draft", "trial", "error", "trial_false", "done"])
  @ApiProperty()
  status?: String;

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
