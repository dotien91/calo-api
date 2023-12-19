import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsString } from "class-validator";

export class CreateChallengeViewDto {
  @IsString()
  @ApiProperty()
  module_id: string;
}
