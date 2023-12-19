import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";
import { CreateChannelLevelDto } from "./create-channel_level.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateChannelLevelDto extends PartialType(CreateChannelLevelDto) {
  @IsString()
  @ApiProperty()
  _id?: string;

  @IsNumberString()
  @ApiPropertyOptional()
  @IsOptional(null)
  official_status?: string;
}
