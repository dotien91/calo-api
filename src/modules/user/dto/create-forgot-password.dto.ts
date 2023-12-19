import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateForgotPassword {
  @IsString()
  @ApiProperty()
  user_email: string;

  @IsString()
  @ApiProperty()
  g_recaptcha: string;
}
