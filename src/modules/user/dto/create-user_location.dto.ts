import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsLatitude, IsLongitude, IsNumberString, IsOptional, IsString } from "class-validator";

export class CreateUserLocationDto {
  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  speed: number

  @IsLatitude()
  @ApiProperty()
  latitude?: number;

  @IsLongitude()
  @ApiProperty()
  longitude?: number;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  low_power_mode?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  battery?: string
}
