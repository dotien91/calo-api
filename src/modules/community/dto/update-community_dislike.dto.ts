import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateCommunityDisLikeDto {
  @IsString()
  @ApiProperty()
  user_id: string;

  @IsString()
  @ApiProperty()
  community_id: string;
}
