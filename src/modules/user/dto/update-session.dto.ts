import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UpdateSessionDto {
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
  apple_signature?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  apple_notification?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  language?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id: string;

  unset_ids?: any[];
}
