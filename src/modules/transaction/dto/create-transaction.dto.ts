import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";
export class CreateTransactionDto {
  @IsString()
  @ApiProperty()
  user_id: string;

  @IsString()
  @ApiPropertyOptional()
  @ApiPropertyOptional()
  from_user?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ref_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ref_type?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ref_name?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ref_url?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ref_avatar?: string;

  @IsNumberString()
  @ApiProperty()
  transaction_value?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  commission_value?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  income_value?: number;

  @IsIn(["plus", "minus"])
  @ApiProperty()
  method: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  status?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  admin_note?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  data_payment?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  trans_id?: string;

  current_coin?: number;
  last_coin?: number;
  note?: string;
  successfully_on?: Date;
  billing_on?: Date;
}
