import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateUserAnonymousSessionDto {
  @IsString()
  @ApiProperty()
  device_id: string;
}
