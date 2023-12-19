import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateUserAnonymousDto {
  @IsString()
  @ApiProperty()
  device_id?: string;

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
  display_name?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  user_type?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  device_signature?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  apple_signature?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  apple_notification?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  language?: string;

  _id?: string;
  is_ab_testing?: boolean;
}
