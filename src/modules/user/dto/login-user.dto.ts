import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

/**
 * @author Tony Vu
 */
export class LoginUserDto {
  @IsString()
  @ApiProperty()
  user_token?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  device_uuid?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  device_type?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  device_signature?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  language?: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  full_name: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  domain?: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  invitation_code?: string;
}
