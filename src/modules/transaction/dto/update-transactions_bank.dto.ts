import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn } from "class-validator";
import { CreateTransactionBankDto } from "./create-transaction_bank.dto";

export class UpdateTransactionBankDto extends CreateTransactionBankDto {
  @IsString()
  @ApiProperty()
  _id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  payment_method?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  bank_name?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  bank_number?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  bank_account_name?: string;
}
