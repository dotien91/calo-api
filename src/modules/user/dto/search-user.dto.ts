import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class SearchUserDto {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_login?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_email?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit?: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  search?: string;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by?: "DESC" | "ASC";

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  block_users?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_phone?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_role?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  locking_for?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_sound?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ids?: any;

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  from?: string;

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  to?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  have_sound?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_interest?: string;

  verify_code?: string;
}
