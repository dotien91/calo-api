import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString } from "class-validator";
import { CreateChallengeDto } from "./create-challenge.dto";
import { CreateChallengeActivityDto } from "./create-challenge_activity.dto";

export class UpdateChallengeActivityDto extends PartialType(CreateChallengeActivityDto) {
  @IsString()
  @ApiProperty()
  _id: string;

  @IsString()
  @IsOptional(null)
  @ApiPropertyOptional()
  admin_note: string;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  official_status?: number;

  @IsNumberString()
  @IsOptional(null)
  @ApiPropertyOptional()
  point_value?: number;
}
