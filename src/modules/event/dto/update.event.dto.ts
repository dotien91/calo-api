import { IsString } from "class-validator";
import { CreateEventDto } from "./create.event.dto";

export class UpdateEventDto extends CreateEventDto {
  @IsString()
  _id: string;
}
