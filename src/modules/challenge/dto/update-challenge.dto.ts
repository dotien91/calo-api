import { PartialType } from "@nestjs/mapped-types";
import { IsString, IsOptional, IsIn, IsNumberString } from "class-validator";
import { CreateChallengeDto } from "./create-challenge.dto";
import { ApiOperation, ApiProperty } from "@nestjs/swagger";

export class UpdateChallengeDto extends PartialType(CreateChallengeDto) {
  @IsString()
  @ApiProperty()
  _id: string;
}
