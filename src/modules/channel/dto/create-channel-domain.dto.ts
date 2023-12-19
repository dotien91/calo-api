import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
export class CreateChannelDomainDto {
  channel_id: string;

  user_id: string;

  @IsString()
  @ApiPropertyOptional()
  domain: string;
}
