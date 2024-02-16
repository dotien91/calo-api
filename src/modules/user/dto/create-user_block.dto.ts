import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export class CreateUserBlockDto {
  @IsString()
  @ApiProperty()
  partner_id: string;
}

export class IgnoreFollowerDTO {
  @IsArray()
  @ApiProperty()
  user_ids: string[];
}
