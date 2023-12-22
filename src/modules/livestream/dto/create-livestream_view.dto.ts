import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";

export class CreateLivestreamViewDto {
	@IsString()
  @ApiProperty()
	livestream_id: string

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  total_time: string

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  view_number?: string
}
