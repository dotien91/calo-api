import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString, IsNumberString, IsIn, IsObject, IsJSON } from "class-validator";
export class CreateRequestCommentDto {
  @IsString()
  @ApiProperty()
  request_id?: string;

  @IsString()
  @ApiPropertyOptional()
  content?: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  parent_id?: string;
}
