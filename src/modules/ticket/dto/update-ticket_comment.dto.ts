import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn, IsJSON, IsNumberString } from "class-validator";
import { CreateTicketDto } from "./create-ticket.dto";
import { PartialType } from "@nestjs/mapped-types";
import { CreateTicketCommentDto } from "./create-ticket_comment.dto";

export class UpdateTicketCommentDto extends PartialType(CreateTicketCommentDto) {
  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  _id?: string;
}
