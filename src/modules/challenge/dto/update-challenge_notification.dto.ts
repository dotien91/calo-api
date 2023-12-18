import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { CreateChallengeDto } from "./create-challenge.dto";
import { CreateChallengeNotificationDto } from "./create-challenge_notification.dto";

export class UpdateChallengeNotificationDto extends PartialType(CreateChallengeNotificationDto) {
  @IsString()
  @ApiProperty()
  _id: string;
}
