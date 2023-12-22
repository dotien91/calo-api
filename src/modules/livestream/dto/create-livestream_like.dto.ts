import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateLivestreamLikeDto {
	@IsString()
  @ApiProperty()
	livestream_id: string

  @IsString()
  @ApiProperty()
	react_type: string
}
