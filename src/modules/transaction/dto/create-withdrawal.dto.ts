import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsString } from "class-validator";
export class CreateWithdrawalDto {
  @IsNumberString()
  @ApiProperty()
  transaction_value: number;

  @IsString()
  @ApiProperty()
  data_payment: string;

  @IsString()
  @ApiProperty()
  transaction_bank: string;
}
