import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateChangePasswordDto {
  @IsString()
  @ApiProperty()
  verify_code: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @ApiProperty()
  user_password: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @ApiProperty()
  re_password: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  g_recaptcha?: string;
}
