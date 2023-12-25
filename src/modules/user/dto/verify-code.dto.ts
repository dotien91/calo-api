import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class VerifyCodeDto {
  @IsEmail()
  @ApiProperty()
  user_email: string;

  @IsString()
  @ApiProperty()
  verify_code: string;
}
