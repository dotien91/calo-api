import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumberString, IsJSON, IsNumber } from "class-validator";
export class CreateRedeemDto {
  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  mission_data: string | any[];

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  gift_data: string | any[];

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  gift_coin: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  redeem_name: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  total_day: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  redeem_status: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  post_avatar: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  attach_files: string | any[];

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  redeem_level: number;
}
