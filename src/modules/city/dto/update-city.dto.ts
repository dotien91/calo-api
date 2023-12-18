import {
  IsString,
  IsJSON,
  IsLatitude,
  IsLongitude,
  IsOptional,
} from "class-validator";
export class UpdateCityDto {
  @IsString()
  _id?: String

  @IsString()
  @IsOptional(null)
  city_name?: string;

  @IsString()
  @IsOptional(null)
  country?: string;

  @IsString()
  @IsOptional(null)
  country_code?: string;

  @IsString()
  @IsOptional(null)
  avatar?: string;

  @IsString()
  @IsOptional(null)
  index_name?: string;

  @IsString()
  avatar_thumbnail?: string;

  @IsJSON()
  @IsOptional(null)
  names?: string;

  @IsLatitude()
  @IsOptional(null)
  latitude?: number;

  @IsLongitude()
  @IsOptional(null)
  longitude?: number;

  @IsJSON()
  @IsOptional(null)
  geometry?: string;
}
