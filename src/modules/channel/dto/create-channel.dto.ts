import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsDateString,
  IsString,
  IsNumberString,
  IsIn,
  IsObject,
  IsNumber,
  IsJSON,
  IsBoolean,
  IsBooleanString,
} from "class-validator";
export class CreateChannelDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsString()
  @ApiProperty()
  avatar: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  cover: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  attach_files: any;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_status: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  sub_domain: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  domain: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  short_description: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  hashtag_id: any;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  mentor_name?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  mentor_phone?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  mentor_address?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  mentor_income?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  mentor_number_member?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  mentor_commission?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_commission?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  mentor_category?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  mentor_target?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  bank_name?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  bank_brand_name?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  bank_account_name?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  bank_account_number?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  bank_qr_code?: string;

  @IsBooleanString()
  @IsOptional(null)
  @ApiPropertyOptional()
  need_approval?: boolean;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  data_config?: string;
}
