import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString, IsIn } from "class-validator";

export class SendPhoneDto {
  @IsString()
  @ApiProperty()
  captcha: string

  @IsString()
  @ApiProperty()
  phone_number: string
}
