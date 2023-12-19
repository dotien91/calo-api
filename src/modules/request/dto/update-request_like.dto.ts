import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateRequestLikeDto {
  @IsString()
  @ApiProperty()
  user_id: string;

  @IsString()
  @ApiProperty()
  request_id: string;
}
