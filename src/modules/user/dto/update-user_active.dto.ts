import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString } from "class-validator";

export class UpdateUserActiveDto {
  @IsNumberString()
  @ApiProperty()
  user_active: number;
}
