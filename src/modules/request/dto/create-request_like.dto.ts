import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateRequestLikeDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  request_id?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  comment_id?: string;
}
