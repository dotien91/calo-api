import { IsIn, IsNumberString, IsOptional, IsString, IsUrl, IsJSON } from "class-validator";

export class CreateEventRatingDto {
  @IsString()
  event_id: string;

  @IsString()
  description: string;

  @IsIn(["1", "2", "3", "4", "5"])
  number_value: string;

  @IsIn(["1", "2", "3", "4", "5"])
  @IsOptional(null)
  number_accuracy: number;

  @IsIn(["1", "2", "3", "4", "5"])
  @IsOptional(null)
  number_communication: number;

  @IsIn(["1", "2", "3", "4", "5"])
  @IsOptional(null)
  number_location: number;

  @IsIn(["1", "2", "3", "4", "5"])
  @IsOptional(null)
  number_check_in: number;

  @IsIn(["1", "2", "3", "4", "5"])
  @IsOptional(null)
  number_for_value: number;

  @IsJSON()
  @IsOptional(null)
  rating_media?: string | string[]
}
