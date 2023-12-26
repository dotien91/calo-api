import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBooleanString,
  IsDateString,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";

export class SearchBaseUserDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  page?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  limit?: number;

  //@IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_smart?: number;

  @IsIn(["DESC", "ASC"])
  @IsOptional(null)
  @ApiPropertyOptional()
  order_by?: "DESC" | "ASC";

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  base_height?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  phone_number?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  locking_for?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  block_users?: any[];

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  follow_users?: any[];

  //@IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_active?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_birthday_year?: string;

  @IsBooleanString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_validated_phone?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  base_weight?: string;

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
  user_interest?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  relationship_status?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_group?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  id_unset?: string;

  //@IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  online_time?: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  language?: string;

  @IsOptional(null)
  @ApiPropertyOptional()
  sexual_content?: string;

  //@IsNumberString()
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

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  event?: string;

  //@IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_guest?: string;

  //@IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_match?: string;

  @IsOptional(null)
  @ApiPropertyOptional()
  is_map?: string;

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

  @IsLongitude()
  @IsOptional(null)
  @ApiPropertyOptional()
  longitude?: number;

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  from?: string;

  @IsDateString()
  @IsOptional(null)
  @ApiPropertyOptional()
  to?: string;

  unset?: string[];
  user_ids?: string[];
  is_avatar?: string;
  user_avatar?: string;
  not_circle_point?: boolean;
  is_circle_point?: string;

  latitude_original?: number;
  longitude_original?: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  ready_status?: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  country?: string;
}
