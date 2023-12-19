import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateUserViewDto {
  @IsString()
  @ApiProperty()
  partner_id: string;
}
