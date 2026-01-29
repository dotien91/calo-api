import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class LoginDeviceDto {
  @IsString()
  @ApiProperty()
  device_uuid: string;

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
}

