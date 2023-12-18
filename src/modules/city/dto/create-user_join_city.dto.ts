import { IsString } from "class-validator";

export class CreateUserJoinCityDto {
	@IsString()
	city_id: string
}
