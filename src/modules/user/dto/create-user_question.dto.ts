import { ApiProperty } from "@nestjs/swagger";
import { IsJSON, IsString } from "class-validator";

export class CreateUserQuestionDto {
  @IsString()
  @ApiProperty()
  note: string;

  @IsJSON()
  @ApiProperty()
  question: string;

  @IsString()
  @ApiProperty()
  image: string;
}
