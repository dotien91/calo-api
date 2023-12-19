import { IsBooleanString, IsOptional, IsString } from "class-validator";

export class UserUpdateSubscribeDto {
  @IsString()
  _id?: string;

  @IsBooleanString()
  @IsOptional(null)
  is_auto_renew: string;
}
