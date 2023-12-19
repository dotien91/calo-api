import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateChannelLikeDto {
  @IsString()
  @ApiProperty()
  video_id: string;
}
