import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateRequestDisLikeDto {
  @IsString()
  @ApiProperty()
  request_id: string;
}
