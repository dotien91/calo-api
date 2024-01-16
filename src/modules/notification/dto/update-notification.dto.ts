import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { CreateNotificationDto } from "./create-notifcation.dto";

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @IsString()
  @ApiProperty()
  _id: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  read_status?: string;
}
