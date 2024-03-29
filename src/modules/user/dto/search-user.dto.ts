import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsIn, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";
import { UserSortBy } from "../interfaces/user.interface";

export class SearchUserDto {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_login?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  less_point?: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_email?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  display_name?: string;

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

  @IsEnum(UserSortBy)
  @IsOptional(null)
  @ApiPropertyOptional()
  sort_by?: UserSortBy;

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
  phone_number?: string;

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

export class GetRankingBoardParams {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit?: number;
}
