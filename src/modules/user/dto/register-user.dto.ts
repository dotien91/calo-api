import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEmail, IsNumber, IsOptional, IsString } from "class-validator";
import { UserCertificate, UserEducation } from "./update-user.dto";

/**
 * @author Tony Vu
 */
export class RegisterUserDto {
  @IsEmail()
  @ApiProperty()
  user_email: string;

  @IsString()
  @ApiProperty()
  user_password: string;

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
  language?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  phone_number?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  device_signature?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_token?: string;

  @IsString()
  @ApiPropertyOptional()
  full_name: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  domain?: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  invitation_code?: string;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional()
  certificates?: Array<UserCertificate>;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional()
  educations?: Array<UserEducation>;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  description?: string;

  @IsArray()
  @IsOptional(null)
  @ApiPropertyOptional()
  skills?: any[];

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  ielts_band?: string;

  @IsNumber()
  @ApiPropertyOptional()
  @IsOptional(null)
  exp_time?: number;
}
