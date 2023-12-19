import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateUserFollowDto {
  @IsString()
  @ApiProperty()
  partner_id: string;
}
