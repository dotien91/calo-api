import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";
export class PlusPointChannelDto {
  @IsString()
  @ApiPropertyOptional()
  user_receive_id?: string;

  @IsNumberString()
  @ApiPropertyOptional()
  point?: string;

  channel_id?: string;

  type_action?: string;
}
