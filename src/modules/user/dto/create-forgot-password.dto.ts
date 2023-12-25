import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateForgotPasswordEmail {
  @IsString()
  @ApiProperty()
  user_email: string;

  @IsString()
  @ApiProperty()
  g_recaptcha: string;
}

export class CreateForgotPasswordPhoneNumber {
  @IsString()
  @ApiProperty()
  phone_number: string;

  @IsString()
  @ApiProperty()
  g_recaptcha: string;
}
