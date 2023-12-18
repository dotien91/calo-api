import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { CreateChallengeDto } from "./create-challenge.dto";
import { CreateChallengeGameDto } from "./create-challenge_game.dto";

export class UpdateChallengeGameDto extends PartialType(CreateChallengeGameDto) {
  @IsString()
  @ApiProperty()
  _id: string;
}
