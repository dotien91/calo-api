import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsString } from "class-validator";
import { CreateChallengeDto } from "./create-challenge.dto";
import { CreateChallengeViewDto } from "./create-challenge_view.dto";

export class UpdateChallengeViewDto extends PartialType(CreateChallengeViewDto) {
  @IsString()
  @ApiProperty()
  _id?: string;

  user_id?: string;
}
