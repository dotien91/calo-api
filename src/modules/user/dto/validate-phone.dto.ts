import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString, IsIn } from "class-validator";

export class ValidatePhoneDto {
  @IsString()
  @ApiProperty()
  validate_code: string

  @IsString()
  @ApiPropertyOptional()
  @IsOptional(null)
  session_id: string

  @IsString()
  @ApiProperty()
  phone_number: string
}
