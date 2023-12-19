import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsJSON, IsOptional, IsString, IsLongitude, IsLatitude, IsNumberString } from "class-validator";

export class CreateEventDto {
  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  address_full: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  livestream_id: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  hash_tag: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  country: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  language: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  city: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  address: string;

  @IsLatitude()
  @IsOptional(null)
  @ApiPropertyOptional()
  latitude?: number;

  @IsLongitude()
  @IsOptional(null)
  @ApiPropertyOptional()
  longitude?: number;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_album?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  category: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  type: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  open_date: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  end_date: string;

  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional()
  min_price: number;

  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional()
  max_price: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  open_ticket_date: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  pre_order_date: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  permission: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  repeat_on: string;

  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional()
  is_remind: number;

  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional()
  event_level: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  event_course: string;

  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional()
  repeat_every: number;

  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional()
  is_recurring: number;

  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional()
  duration: number;

  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional()
  end_occurrences: number;
}
