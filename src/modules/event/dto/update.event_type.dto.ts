import { IsString, IsOptional, IsUrl } from "class-validator";
import { CreateEventTypeDto } from "./create.event_type.dto";

export class UpdateEventTypeDto extends CreateEventTypeDto {
  @IsString()
  _id: string;

  @IsString()
  @IsOptional(null)
  name: string;

  @IsString()
  @IsOptional(null)
  description: string;

  @IsUrl()
  @IsOptional(null)
  icon: string;

  @IsString()
  @IsOptional(null)
  parent_id: string;
}
