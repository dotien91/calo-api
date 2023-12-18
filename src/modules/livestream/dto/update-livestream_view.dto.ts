import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsString } from "class-validator";

export class UpdateLivestreamViewDto {
  @IsString()
  @ApiProperty()
  user_id: string;

  @IsString()
  @ApiProperty()
  livestream_id: string;

  @IsNumberString()
  @ApiProperty()
  total_time: number;
}
