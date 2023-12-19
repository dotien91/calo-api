import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumberString } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";
import { CreateTicketCategoryDto } from "./create-ticket_category.dto";

export class UpdateTicketCategoryDto extends PartialType(CreateTicketCategoryDto) {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id?: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  public_status?: string;
}
