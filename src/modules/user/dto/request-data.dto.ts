import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RequestDataDto {
  @IsString()
  @ApiProperty()
  partner_id: string
}
