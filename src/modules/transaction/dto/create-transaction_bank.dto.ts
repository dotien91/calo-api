import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
export class CreateTransactionBankDto {
  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  user_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id?: string;

  @IsString()
  @ApiProperty()
  payment_method?: string;

  @IsString()
  @ApiProperty()
  bank_name?: string;

  @IsString()
  @ApiProperty()
  bank_number?: string;

  @IsString()
  @ApiProperty()
  bank_account_name?: string;
}
