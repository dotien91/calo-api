import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateChangePasswordDto {
  @IsString()
  @ApiProperty()
  email_token: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @ApiProperty()
  user_password: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @ApiProperty()
  re_password: string

  @IsString()
  @ApiProperty()
  g_recaptcha: string;
}
