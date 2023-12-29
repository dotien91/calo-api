import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateMapTokenDto {
  @IsString()
  @ApiProperty()
  access_token: string

  @IsString()
  @ApiProperty()
  token_type: string

  @IsString()
  @ApiProperty()
  expires_in: string

  @IsString()
  @ApiProperty()
  user_id: string
}
