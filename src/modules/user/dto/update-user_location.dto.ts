import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateUserLocationDto {
  @IsString()
  @ApiProperty()
  user_id: string;
}
