import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";

export class CreateInviteEmail {
  @IsString()
  @ApiProperty()
  channel_id?: string;

  @IsString()
  @ApiProperty()
  email?: string;
}
