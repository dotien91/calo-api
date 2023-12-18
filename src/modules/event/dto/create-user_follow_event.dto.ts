import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateUserFollowEventDto {
	@IsString()
  @ApiProperty()
	event_id: string
}
