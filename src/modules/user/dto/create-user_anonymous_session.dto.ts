import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateUserAnonymousSessionDto {
  @IsString()
  @ApiProperty()
  device_id: string;
}
