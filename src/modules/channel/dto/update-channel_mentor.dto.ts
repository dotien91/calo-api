import { PartialType } from "@nestjs/mapped-types";
import { IsString, IsOptional, IsIn, IsNumberString, IsJSON } from "class-validator";
import { CreateChannelDto } from "./create-channel.dto";
import { ApiOperation, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateChannelMentorDto extends PartialType(CreateChannelDto) {
  @IsString()
  @ApiProperty()
  channel_id: string;

  @IsString()
  @ApiProperty()
  mentor_id: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  user_ids?: string;
}
