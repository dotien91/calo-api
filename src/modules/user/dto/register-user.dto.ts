import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

/**
 * @author Tony Vu
 */
export class RegisterUserDto {
  @IsEmail()
  @ApiProperty()
  user_email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: "Password too weak!" })
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
  user_phone?: string

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
  referal_user?: string;
}
