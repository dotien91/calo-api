import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SendPhoneDto {
  @IsString()
  @ApiProperty()
  captcha: string;

  @IsString()
  @ApiProperty()
  phone_number: string;
}
