import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsJSON, IsBooleanString } from "class-validator";
export class CreateHandleServiceDto {
  @IsString()
  @ApiProperty()
  handle: string | String;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  title: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  description: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  avatar: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_album?: any;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  sub_menu?: any;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  long_description?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  icon_side_bar?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  service_type?: string;

  @IsBooleanString()
  @IsOptional(null)
  @ApiPropertyOptional()
  active_status?: string;

  @IsBooleanString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_admin?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  title_side_bar?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_show_side_bar?: boolean;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  router_link?: string;
}
