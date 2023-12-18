import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateChallengePermissionDto {
	@IsString()
  @ApiProperty()
	challenge_id: string

  @IsString()
  @ApiProperty()
  user_id: string

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  official_status?: number
}
