import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateCommunityLikeDto {
  @IsString()
  @ApiProperty()
  user_id: string;

  @IsString()
  @ApiProperty()
  community_id: string;
}
