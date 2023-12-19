import { PartialType } from "@nestjs/swagger";
import { CreateSubscribeDto } from "./create-subscribe.dto";
import { IsOptional, IsString, IsIn, IsDateString, IsBooleanString } from "class-validator";

export class UserUpdateSubscribeDto {
  @IsString()
  _id?: string;

  @IsBooleanString()
  @IsOptional(null)
  is_auto_renew: string;
}
