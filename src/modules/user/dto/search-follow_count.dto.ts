import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SearchFollowCountDto {
  @IsString()
  @ApiProperty()
  user_id: string;
}
