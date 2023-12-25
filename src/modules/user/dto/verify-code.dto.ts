import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class VerifyCodeDto {
  @IsEmail()
  @ApiProperty()
  @IsOptional()
  user_email?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  phone_number?: string;

  @IsString()
  @ApiProperty()
  verify_code: string;
}
