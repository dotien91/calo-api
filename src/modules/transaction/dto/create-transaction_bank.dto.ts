import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
export class CreateTransactionBankDto {
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
