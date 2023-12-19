import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn, IsJSON, IsNumberString } from "class-validator";
import { CreateTicketDto } from "./create-ticket.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id?: String;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_pin?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  is_comment?: string;
}
