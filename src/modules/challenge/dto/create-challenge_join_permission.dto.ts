import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateChallengeJoinPermissionDto {
	@IsString()
  @ApiProperty()
	challenge_id: string

  official_status?: number
  user_id: string
}
