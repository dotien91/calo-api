import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

/**
 * @author Tony Vu
 */
export class LoginUserPasswordDto {
  @IsEmail()
  @ApiProperty()
  user_email: string;

  @IsString()
  @ApiProperty()
  user_password: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  device_uuid: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  device_type: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  device_signature: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  full_name: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_token: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  language: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  g_recaptcha: string

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  domain?: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  referal_user?: string;

}
