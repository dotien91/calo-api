import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class DeleteChallengePermissionDto {
	@IsString()
  @ApiProperty()
	challenge_id: string

  @IsString()
  @ApiProperty()
  user_id: string
}
