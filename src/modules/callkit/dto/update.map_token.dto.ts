import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateMapTokenDto {
  @IsString()
  @ApiProperty()
  _id: string;
}
