import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString, IsIn, IsLatitude, IsLongitude, IsDateString } from "class-validator";

export class SearchAdminFilterDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by?: "DESC" | "ASC";

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  type?: string;

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  from?: string;

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  to?: string;

  @IsIn(["_id", "user_login", "display_name", "user_email"])
  @ApiPropertyOptional()
  @IsOptional(null)
  select?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  search?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  country?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  last_active?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  status?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  plan_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  service_id?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  payment_method?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_smart?: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  base_height?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  block_users?: any[];

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  follow_users?: any[];

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_active?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_birthday_year?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_birthday_year_from?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_birthday_year_to?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  base_weight?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  locking_for?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  base_role?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  body_type?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  relationship_status?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  online_time?: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  language?: string;

  //@IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  sexual_content?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  premium_level?: string;

  //@IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  free_number?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  city?: string;

  //@IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_guest?: string;

  //@IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_match?: string;

  //@IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_spotlight?: string;

  //@IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  distance?: number;

  @IsLatitude()
  @IsOptional(null)
  @ApiPropertyOptional()
  latitude?: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  method?: string;

  @IsLongitude()
  @IsOptional(null)
  @ApiPropertyOptional()
  longitude?: number;
}
