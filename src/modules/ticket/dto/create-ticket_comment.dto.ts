import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject, IsJSON } from "class-validator";
export class CreateTicketCommentDto {
  @IsString()
  @ApiProperty()
  ticket_id?: string;

  @IsString()
  @ApiPropertyOptional()
  content?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  parent_id?: string;

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  attach_files?: any;
}
