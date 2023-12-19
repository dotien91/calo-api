import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateChannelBannerDto {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  channel_id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  banner_url: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  banner_type: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  media_id: string;
}
