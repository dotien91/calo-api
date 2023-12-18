import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, Min, Max, IsInt } from "class-validator";
export class CreateWithdrawalDto {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id: string;

  @IsNumberString()
  @ApiProperty()
  transaction_value: number;

  @IsString()
  @ApiProperty()
  data_payment: string

  @IsString()
  @ApiProperty()
  transaction_bank: string

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  channel_id?: string
}
