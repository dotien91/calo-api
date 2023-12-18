import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsJSON, IsOptional, IsString } from "class-validator";

export class CreateRequestPollDto {
	@IsString()
  @IsOptional(null)
  @ApiProperty()
	request_id?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
	comment_id?: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
	poll_id?: string

  @IsJSON()
  @IsOptional(null)
  @ApiPropertyOptional()
  question?: string
}
