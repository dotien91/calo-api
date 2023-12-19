import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateUserGiftDto } from "./create-user_gift.dto";
import { IsNumberString, IsOptional, IsString } from "class-validator";

export class UpdateUserGiftDto {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  gift_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  gift_status?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  quantity?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  total_price?: number;
}
