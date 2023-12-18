import {
  IsString,
  IsJSON,
  IsLatitude,
  IsLongitude,
} from "class-validator";
export class CreateCityDto {
  @IsString()
  city_name: string;

  @IsString()
  country: string;

  @IsString()
  country_code: string;

  @IsString()
  avatar: string;

  @IsString()
  avatar_thumbnail: string;

  @IsJSON()
  names: string;

  @IsString()
  index_name: string;

  @IsLatitude()
  latitude?: number;

  @IsLongitude()
  longitude?: number;

  @IsJSON()
  geometry: string;
}
