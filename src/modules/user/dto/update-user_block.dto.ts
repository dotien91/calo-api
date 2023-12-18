import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class UpdateUserBlockDto {
  @IsString()
  @ApiProperty()
  user_id: string

  @IsString()
  @ApiProperty()
  partner_id: string
}
