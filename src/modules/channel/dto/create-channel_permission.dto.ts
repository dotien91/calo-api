import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsJSON, IsNumberString, IsOptional, IsString } from "class-validator";

export class CreateChannelPermissionDto {
  @IsString()
  @ApiProperty()
  channel_id?: string;

  @IsString()
  @ApiProperty()
  user_id?: string;

  @IsJSON()
  @ApiPropertyOptional()
  @IsOptional(null)
  permission?: any;

  @IsString()
  @ApiProperty()
  channel_role?: any;
}
