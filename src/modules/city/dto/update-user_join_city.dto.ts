import { IsString } from "class-validator";

export class UpdateUserJoinCityDto {
  @IsString()
  user_id: string;

  @IsString()
  city_id: string;
}
