import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString, IsIn } from "class-validator";

export class SearchFollowCountDto {
  @IsString()
  @ApiProperty()
  user_id: string;
}
