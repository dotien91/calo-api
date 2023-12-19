import { IsString, IsOptional, IsUrl, IsIn } from "class-validator";
import { CreateEventRatingDto } from "./create.event_rating.dto";

export class UpdateEventRatingDto extends CreateEventRatingDto {
  @IsString()
  event_id: string;

  @IsString()
  @IsOptional(null)
  description: string;

  @IsIn(["1", "2", "3", "4", "5"])
  @IsOptional(null)
  number_value: string;

  user_id: string;
}
