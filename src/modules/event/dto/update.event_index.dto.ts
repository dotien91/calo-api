import { IsString, IsOptional, IsUrl } from "class-validator";
import { CreateEventIndexDto } from "./create.event_index.dto";

export class UpdateEventIndexDto extends CreateEventIndexDto {
  @IsString()
  _id: string;
}
