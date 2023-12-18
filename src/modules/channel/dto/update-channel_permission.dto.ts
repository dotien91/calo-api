import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";
import { CreateChannelPermissionDto } from "./create-channel_permission.dto";

export class UpdateChannelPermissionDto extends PartialType(CreateChannelPermissionDto) {
  @IsString()
  @ApiProperty()
  _id?: string

  @IsNumberString()
  @ApiPropertyOptional()
  @IsOptional(null)
  official_status?: string

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  mentor_role?: string

  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  from_mentor?: string

  from_user?: string
}
