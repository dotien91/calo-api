import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateUserMoodDto {
  @IsString()
  @ApiProperty()
  user_id: string;

  @IsString()
  @ApiProperty()
  text: string;

  @IsString()
  @ApiProperty()
  image: string;
}
