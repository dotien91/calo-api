import { ApiProperty } from "@nestjs/swagger";
import { IsJSON, IsString } from "class-validator";

export class SendVoipDto {
  @IsString()
  @ApiProperty()
  token: string;

  @IsJSON()
  @ApiProperty()
  param: string;
}
