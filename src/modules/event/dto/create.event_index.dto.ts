import { IsDateString, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateEventIndexDto {
  @IsString()
  event_id: string;

  @IsDateString()
  event_date: string;
}
