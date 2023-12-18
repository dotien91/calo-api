import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsJSON, IsOptional, IsString } from "class-validator";

export class CreateChallengeNotificationDto {
  @IsString()
  @ApiProperty()
  title: string

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  description: string

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  channel_id: string

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  challenge_id: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_album?: any
}
