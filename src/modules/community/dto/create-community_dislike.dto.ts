import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateCommunityDisLikeDto {
	@IsString()
  @ApiProperty()
	community_id: string
}
